import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import {
  isStoredUserProfileComplete,
  upsertGoogleUser,
  findStoredUserByEmail,
  findStoredUserByIdentifier,
  verifyPassword,
  recordUserLogin,
} from "@/lib/user-store";

// Strip trailing slash — must happen before NextAuth reads the env var
if (process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL.replace(/\/+$/, "");
}

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

if (!googleClientId || !googleClientSecret) {
  console.warn("Google OAuth is disabled: missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET.");
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

      const user = await findStoredUserByIdentifier(identifier);
      if (!user) {
        return null;
      }

      const isValid = verifyPassword(password, user.passwordHash);
      if (!isValid) {
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
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email && account.providerAccountId) {
        try {
          const storedUser = await upsertGoogleUser({
            name: user.name || "",
            email: user.email,
            googleId: account.providerAccountId,
          });

          (user as any).id = storedUser.id;
          (user as any).kycLevel = storedUser.kycLevel ?? 0;
          (user as any).profileComplete = isStoredUserProfileComplete(storedUser);
          (user as any).dashboardAccessGranted = true;
        } catch (error) {
          console.error("Google sign-in provisioning failed", error);
          (user as any).id = account.providerAccountId;
          (user as any).kycLevel = 0;
          (user as any).profileComplete = false;
          (user as any).dashboardAccessGranted = true;
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
        token.dashboardAccessGranted = true;
      }

      // Apply explicit session update values before any DB lookup.
      if (trigger === "update" && session) {
        if (typeof (session as any).profileComplete === "boolean") {
          token.profileComplete = Boolean((session as any).profileComplete);
        }
        if (typeof (session as any).kycLevel === "number") {
          token.kycLevel = Number((session as any).kycLevel);
        }
      }

      // Refresh user data from SeaTable on sign-in and on explicit session updates.
      // Wrapped in try-catch so a SeaTable failure never breaks the auth flow.
      if (token.email && (user || trigger === "update")) {
        try {
          const storedUser = await findStoredUserByEmail(token.email as string);
          if (storedUser) {
            token.kycLevel = storedUser.kycLevel ?? 0;
            token.id = storedUser.id;
            token.profileComplete = isStoredUserProfileComplete(storedUser);
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
        (session.user as any).dashboardAccessGranted = true;
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
