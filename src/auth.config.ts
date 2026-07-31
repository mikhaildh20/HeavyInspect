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
        token.avatarUrl = (user as unknown as Record<string, unknown>).avatarUrl || '';
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        (session.user as unknown as Record<string, unknown>).mustChangePassword = token.mustChangePassword;
        (session.user as unknown as Record<string, unknown>).avatarUrl = token.avatarUrl || '';
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
