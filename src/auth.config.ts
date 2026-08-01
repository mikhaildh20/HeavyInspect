import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  providers: [],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.mustChangePassword = (user as unknown as Record<string, unknown>).mustChangePassword;
        // avatarUrl NOT stored in JWT to prevent cookie bloat (base64 data URIs)
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
        (session.user as unknown as Record<string, unknown>).mustChangePassword = token.mustChangePassword;
        // avatarUrl fetched from DB where needed, not from JWT
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
