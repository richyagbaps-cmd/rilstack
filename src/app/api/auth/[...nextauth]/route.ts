import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import {
  findStoredUserByEmail,
  verifyPassword,
  createStoredUser,
} from "@/lib/user-store";
import crypto from "crypto";

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
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;

        if (!email || !password) {
          return null;
        }

        const user = await findStoredUserByEmail(email);
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
        };
      },
    }),
  ],
  pages: {
    signIn: "/",
  },
  callbacks: {
    async signIn({ user, account }) {
      // Create user record for Google sign-in if they don't exist
      if (account?.provider === "google" && user.email) {
        const existing = await findStoredUserByEmail(user.email);
        if (!existing) {
          await createStoredUser({
            name: user.name || "",
            email: user.email,
            password: crypto.randomUUID(),
            phone: "",
          });
        }
      }
      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.kycLevel = (user as any).kycLevel ?? 0;
      }
      // Re-fetch kycLevel when session.update() is called
      if (trigger === "update" && token.email) {
        const storedUser = await findStoredUserByEmail(token.email as string);
        if (storedUser) {
          token.kycLevel = storedUser.kycLevel ?? 0;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).kycLevel = token.kycLevel ?? 0;
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
