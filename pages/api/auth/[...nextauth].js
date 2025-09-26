import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '../../../lib/prisma';

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
  ],
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async session({ session, user }) {
      if (session?.user) {
        if (user?.id) {
          session.user.id = user.id;
        } else if (!session.user.id && session.user.email) {
          const existingUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true },
          });

          if (existingUser) {
            session.user.id = existingUser.id;
          }
        }
      }

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export default handler;
