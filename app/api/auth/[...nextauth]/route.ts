import NextAuth, { type DefaultSession } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getDatabase } from "@/app/lib/mongodb";

interface User {
  _id: string;
  username: string;
  email: string;
  password_hash: string;
  phone_number?: string;
  created_at: Date;
  updated_at: Date;
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      phone_number?: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    name: string;
    email: string;
    phone_number?: string;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string;
    email: string;
    phone_number?: string;
    role: string;
  }
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log('Authorization attempt with credentials:', credentials);
        
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing email or password');
          return null;
        }

        try {
          const db = await getDatabase();
          console.log('Database connected');
          
          const user = await db.collection<User>('users').findOne({ email: credentials.email });
          console.log('User found:', user);

          if (!user) {
            console.log('User not found');
            return null;
          }

          const isValidPassword = await bcrypt.compare(credentials.password, user.password_hash);
          console.log('Password valid:', isValidPassword);

          if (!isValidPassword) {
            console.log('Invalid password');
            return null;
          }

          console.log('Authorization successful');
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.username,
            phone_number: user.phone_number,
            role: 'user',
          };
        } catch (error) {
          console.error('Authorization error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 36000, // 10 hours
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.phone_number = user.phone_number;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: JWT }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.phone_number = token.phone_number;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || '0Vco2PJJvH47BjnzgQJAnLYnDPmYI4fiTeGScFizAF1P1YRv04YsNxAYrbqX/l/kG0U488SWgs8jnD+TxXczJA==',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
