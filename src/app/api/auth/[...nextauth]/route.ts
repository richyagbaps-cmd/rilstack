import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import {
  hasStoredUserDashboardAccess,
  isStoredUserProfileComplete,
  findStoredUserByEmail,
  findStoredUserByIdentifierAndPassword,
  recordUserLogin,
} from "@/lib/user-store";
import {
  expressJsonRequest,
  getExpressBackendBaseUrl,
  isExpressBackendEnabled,
} from "@/lib/express-backend";

// Strip trailing slash — must happen before NextAuth reads the env var
if (process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL.replace(/\/+$/, "");
}

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

if (!googleClientId || !googleClientSecret) {
  console.warn("Google OAuth is disabled: missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET.");
}

function inferExpressProfileComplete(user: any): boolean {
  const kycStatus = String(user?.KYC_Status || "").trim().toLowerCase();
  if (kycStatus === "pending" || kycStatus === "verified") return true;

  // Fallback for older rows where status may be empty but profile data exists.
  const hasAddressCore = Boolean(String(user?.Address || "").trim() && String(user?.State || "").trim());
  const hasIdentity = Boolean(String(user?.NIN || user?.ID_Number || "").trim());
  return hasAddressCore && hasIdentity;
}

const providers = [
  ...(googleClientId && googleClientSecret
    ? [
        GoogleProvider({
          clientId: googleClientId,
          clientSecret: googleClientSecret,
          authorization: {
            params: {
              access_type: "online",
              prompt: "select_account",
              scope: "openid email profile",
            },
          },
        }),
      ]
    : []),
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      identifier: { label: "Email or Phone", type: "text" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const identifier =
        credentials?.identifier?.trim() || credentials?.email?.trim() || "";
      const password = credentials?.password;

      if (!identifier || !password) {
        return null;
      }

      if (isExpressBackendEnabled()) {
        const result = await expressJsonRequest<any>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ identifier, password }),
        });

        if (!result.ok || !result.data?.user) {
          return null;
        }

        const u = result.data.user;
        const fullName = [u.Surname, u.First_Name, u.Middle_Name]
          .map((v: unknown) => String(v || "").trim())
          .filter(Boolean)
          .join(" ");

        return {
          id: String(u.User_ID || u._id || identifier),
          name: fullName || String(u.First_Name || u.Surname || "User"),
          email: String(u.Email || identifier),
          kycLevel: 0,
          profileComplete: inferExpressProfileComplete(u),
          dashboardAccessGranted: inferExpressProfileComplete(u),
          expressAccessToken: result.data?.token,
        } as any;
      }

      const user = await findStoredUserByIdentifierAndPassword(identifier, password);
      if (!user) {
        return null;
      }

      // Fire-and-forget — don't block sign-in on a SeaTable write
      recordUserLogin(user.email).catch(() => {});

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        kycLevel: user.kycLevel ?? 0,
        profileComplete: isStoredUserProfileComplete(user),
        dashboardAccessGranted: true,
      };
    },
  }),
];

const handler = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && user.email && account.providerAccountId) {
        if (isExpressBackendEnabled()) {
          try {
            const fallbackParts = String(user.name || "")
              .trim()
              .split(/\s+/)
              .filter(Boolean);
            const firstName =
              String((profile as any)?.given_name || "").trim() || fallbackParts[0] || "User";
            const lastName =
              String((profile as any)?.family_name || "").trim() || fallbackParts[1] || "Google";
            const avatarUrl = String((profile as any)?.picture || user.image || "").trim();

            const params = new URLSearchParams({
              mode: "signup",
              email: String(user.email).trim().toLowerCase(),
              first_name: firstName,
              last_name: lastName,
              google_id: String(account.providerAccountId || "").trim(),
            });
            if (avatarUrl) params.set("avatar_url", avatarUrl);

            const response = await fetch(
              `${getExpressBackendBaseUrl()}/auth/google?${params.toString()}`,
              {
                method: "GET",
                redirect: "manual",
                cache: "no-store",
              },
            );

            const locationHeader = response.headers.get("location") || "";
            if (locationHeader) {
              const locationUrl = new URL(locationHeader, getExpressBackendBaseUrl());
              const expressToken = String(locationUrl.searchParams.get("token") || "").trim();
              const googleTempToken = String(
                locationUrl.searchParams.get("google_temp_token") || "",
              ).trim();

              if (expressToken) {
                (user as any).id = String(account.providerAccountId || user.email);
                (user as any).kycLevel = 1;
                (user as any).profileComplete = true;
                (user as any).dashboardAccessGranted = true;
                (user as any).expressAccessToken = expressToken;
                (user as any).googleTempToken = null;
                return true;
              }

              if (googleTempToken) {
                (user as any).id = String(account.providerAccountId || user.email);
                (user as any).kycLevel = 0;
                (user as any).profileComplete = false;
                (user as any).dashboardAccessGranted = false;
                (user as any).googleTempToken = googleTempToken;
                (user as any).expressAccessToken = null;
                return true;
              }
            }
          } catch (error) {
            console.error("Express Google callback bridge failed", error);
          }

          // Let sign-in continue; UI will surface completion state/fallback paths.
          (user as any).id = String(account.providerAccountId || user.email);
          (user as any).kycLevel = 0;
          (user as any).profileComplete = false;
          (user as any).dashboardAccessGranted = false;
          return true;
        }

        try {
          const storedUser = await findStoredUserByEmail(user.email);

          if (storedUser) {
            // Fire-and-forget — do not block sign-in if login counter update fails.
            recordUserLogin(storedUser.email).catch(() => {});

            (user as any).id = storedUser.id;
            (user as any).kycLevel = storedUser.kycLevel ?? 0;
            (user as any).profileComplete = isStoredUserProfileComplete(storedUser);
            (user as any).dashboardAccessGranted = hasStoredUserDashboardAccess(storedUser);
          } else {
            // New Google users: defer first SeaTable insert until complete-profile submit.
            (user as any).id = account.providerAccountId;
            (user as any).kycLevel = 0;
            (user as any).profileComplete = false;
            (user as any).dashboardAccessGranted = false;
          }
        } catch (error) {
          console.error("Google sign-in lookup failed", error);
          (user as any).id = account.providerAccountId;
          (user as any).kycLevel = 0;
          (user as any).profileComplete = false;
          (user as any).dashboardAccessGranted = false;
          return true;
        }
      }

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.kycLevel = (user as any).kycLevel ?? 0;
        token.profileComplete = (user as any).profileComplete ?? true;
        token.dashboardAccessGranted = (user as any).dashboardAccessGranted ?? true;
        token.expressAccessToken = (user as any).expressAccessToken || token.expressAccessToken;
        token.googleTempToken = (user as any).googleTempToken ?? token.googleTempToken ?? null;
      }

      // Apply explicit session update values before any DB lookup.
      if (trigger === "update" && session) {
        if (typeof (session as any).profileComplete === "boolean") {
          token.profileComplete = Boolean((session as any).profileComplete);
        }
        if (typeof (session as any).kycLevel === "number") {
          token.kycLevel = Number((session as any).kycLevel);
        }
        if (typeof (session as any).dashboardAccessGranted === "boolean") {
          token.dashboardAccessGranted = Boolean((session as any).dashboardAccessGranted);
        }
        if (typeof (session as any).expressAccessToken === "string") {
          token.expressAccessToken = String((session as any).expressAccessToken || "").trim() || null;
        }
        if (Object.prototype.hasOwnProperty.call(session as any, "googleTempToken")) {
          const raw = (session as any).googleTempToken;
          token.googleTempToken =
            typeof raw === "string" ? String(raw || "").trim() || null : raw == null ? null : token.googleTempToken;
        }
      }

      // Refresh user data from SeaTable on sign-in and on explicit session updates.
      // Wrapped in try-catch so a SeaTable failure never breaks the auth flow.
      if (!isExpressBackendEnabled() && token.email && (user || trigger === "update")) {
        try {
          const storedUser = await findStoredUserByEmail(token.email as string);
          if (storedUser) {
            token.kycLevel = storedUser.kycLevel ?? 0;
            token.id = storedUser.id;
            const seaTableComplete = isStoredUserProfileComplete(storedUser);
            // Never downgrade a token that was already marked complete — prevents
            // returning users being looped back to /profile/complete if their
            // KYC_Data_JSON was written by an older code path that omitted detailsComplete.
            token.profileComplete = seaTableComplete || (token.profileComplete === true);
            token.dashboardAccessGranted = true;
          }
        } catch (err) {
          console.error("JWT SeaTable lookup failed (non-fatal)", err);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).kycLevel = token.kycLevel ?? 0;
        (session.user as any).profileComplete = token.profileComplete ?? true;
        (session.user as any).dashboardAccessGranted = (token as any).dashboardAccessGranted ?? true;
        (session.user as any).expressAccessToken = (token as any).expressAccessToken || null;
        (session.user as any).googleTempToken = (token as any).googleTempToken || null;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      try {
        if (new URL(url).origin === baseUrl) {
          return url;
        }
      } catch {
        return baseUrl;
      }

      return baseUrl;
    },
  },
});

export { handler as GET, handler as POST };
