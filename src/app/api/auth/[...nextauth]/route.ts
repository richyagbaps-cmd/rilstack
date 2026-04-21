import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import {
  findStoredUserByEmail,
  findStoredUserByIdentifier,
  verifyPassword,
  isStoredUserProfileComplete,
  upsertGoogleUser,
} from "@/lib/user-store";

const handler = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
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
        };
      },
    }),
  ],
  pages: {
    signIn: "/",
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

          if (!isStoredUserProfileComplete(storedUser)) {
            return "/signup?provider=google";
          }
        } catch (error) {
          console.error("Google sign-in provisioning failed", error);
          // Fallback: allow OAuth session even when SeaTable provisioning is temporarily unavailable.
          (user as any).id = account.providerAccountId;
          (user as any).kycLevel = 0;
          (user as any).profileComplete = true;
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
      }

      if (trigger === "update" && token.email) {
        const storedUser = await findStoredUserByEmail(token.email as string);
        if (storedUser) {
          token.kycLevel = storedUser.kycLevel ?? 0;
          token.id = storedUser.id;
          token.profileComplete = isStoredUserProfileComplete(storedUser);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).kycLevel = token.kycLevel ?? 0;
        (session.user as any).profileComplete = token.profileComplete ?? true;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      if (new URL(url).origin === baseUrl) {
        return url;
      }

      return baseUrl;
    },
  },
});

export { handler as GET, handler as POST };
