import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { connectDB } from './db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email:    { label: 'Email',        type: 'email'    },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await connectDB();

        const user = await User.findOne({ email: credentials.email, isActive: true })
          .populate('role')
          .lean();

        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password as string
        );

        if (!isValid) return null;

        return {
          id:          user._id.toString(),
          name:        user.name,
          email:       user.email,
          role:        (user.role as any).name,
          permissions: (user.role as any).permissions,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id          = user.id;
        token.role        = (user as any).role;
        token.permissions = (user as any).permissions;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id          = token.id as string;
      session.user.role        = token.role as string;
      session.user.permissions = token.permissions as string[];
      return session;
    },
  },
  session: { strategy: 'jwt' },
  pages:   { signIn: '/login' },
});