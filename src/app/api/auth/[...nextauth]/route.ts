import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import {
  findStoredUserByEmail,
  findStoredUserByIdentifier,
  hasStoredUserDashboardAccess,
  verifyPassword,
  isStoredUserProfileComplete,
  upsertGoogleUser,
} from "@/lib/user-store";

const normalizedNextAuthUrl = process.env.NEXTAUTH_URL?.replace(/\/+$/, "");
if (normalizedNextAuthUrl) {
  process.env.NEXTAUTH_URL = normalizedNextAuthUrl;
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
          (user as any).dashboardAccessGranted = hasStoredUserDashboardAccess(storedUser);

          if (!hasStoredUserDashboardAccess(storedUser)) {
            return "/signup?provider=google";
          }
        } catch (error) {
          console.error("Google sign-in provisioning failed", error);
          // Keep OAuth sign-in successful, but force onboarding until SeaTable user is saved.
          (user as any).id = account.providerAccountId;
          (user as any).kycLevel = 0;
          (user as any).profileComplete = false;
          (user as any).dashboardAccessGranted = false;
          return true;
        }
      }

      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.kycLevel = (user as any).kycLevel ?? 0;
        token.profileComplete = (user as any).profileComplete ?? true;
        token.dashboardAccessGranted =
          (user as any).dashboardAccessGranted ?? ((user as any).profileComplete ?? true);
      }

      if (trigger === "update" && token.email) {
        const storedUser = await findStoredUserByEmail(token.email as string);
        if (storedUser) {
          token.kycLevel = storedUser.kycLevel ?? 0;
          token.id = storedUser.id;
          token.profileComplete = isStoredUserProfileComplete(storedUser);
          token.dashboardAccessGranted = hasStoredUserDashboardAccess(storedUser);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).kycLevel = token.kycLevel ?? 0;
        (session.user as any).profileComplete = token.profileComplete ?? true;
        (session.user as any).dashboardAccessGranted = token.dashboardAccessGranted ?? false;
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
