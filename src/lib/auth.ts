import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "@/lib/rateLimit";

const FIFTEEN_MINUTES = 15 * 60 * 1000;

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Brute-force guard: cap attempts per client and per account.
        const headers = (req?.headers ?? {}) as Record<string, string | string[] | undefined>;
        const header = (name: string) => {
          const v = headers[name];
          return Array.isArray(v) ? v[0] : v;
        };
        const ip = clientIp(header);
        const email = credentials.email.toLowerCase();
        const byIp = rateLimit(`login:ip:${ip}`, 10, FIFTEEN_MINUTES);
        const byEmail = rateLimit(`login:email:${email}`, 10, FIFTEEN_MINUTES);
        if (!byIp.ok || !byEmail.ok) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.hashedPassword);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/admin/login",
  },
  // No fallback: a hardcoded secret here would let anyone forge admin sessions if the env
  // var were ever missing. next-auth refuses to run in production without one (fails closed).
  secret: process.env.NEXTAUTH_SECRET,
};

/** Throws unless the request comes from a signed-in admin. Call at the top of every server action. */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }
  return session;
}
