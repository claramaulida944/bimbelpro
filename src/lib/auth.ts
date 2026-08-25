import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Kata Sandi', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email dan kata sandi wajib diisi');
        }

        const pengguna = await prisma.pengguna.findUnique({
          where: { email: credentials.email },
        });

        if (!pengguna || !pengguna.passwordHash) {
          throw new Error('Kredensial tidak valid atau akun login via penyedia eksternal');
        }

        const isValid = await bcrypt.compare(credentials.password, pengguna.passwordHash);

        if (!isValid) {
          throw new Error('Kata sandi salah');
        }

        return {
          id: pengguna.id,
          email: pengguna.email,
          name: pengguna.nama, // Keep name for next-auth defaults
          nama: pengguna.nama,
          peran: pengguna.peran,
          saldoRinCoin: pengguna.saldoRinCoin,
        };
      },
    }),
  ],
  pages: {
    signIn: '/masuk',
    error: '/masuk',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        if (!user.email) return false;
        
        let pengguna = await prisma.pengguna.findUnique({
          where: { email: user.email },
        });

        if (!pengguna) {
          pengguna = await prisma.pengguna.create({
            data: {
              nama: user.name || 'Siswa Baru',
              email: user.email,
              passwordHash: '', // Placeholder since they registered via OAuth
              peran: 'SISWA',
              saldoRinCoin: 0,
            },
          });
        }
        
        // Pass info to user object so it gets put into JWT
        (user as any).peran = pengguna.peran;
        (user as any).saldoRinCoin = pengguna.saldoRinCoin;
        (user as any).nama = pengguna.nama;
        user.id = pengguna.id;
        user.name = pengguna.nama;
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.peran = (user as any).peran;
        token.nama = (user as any).nama;
        token.name = user.name;
        token.email = user.email || '';
        token.picture = user.image;
        token.saldoRinCoin = (user as any).saldoRinCoin;
      }
      
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.email) token.email = session.email;
        if (session.image) token.picture = session.image;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.peran = token.peran as any; // Cast to any or PeranPengguna
        session.user.name = token.name as string;
        session.user.nama = token.nama as string;
        session.user.email = token.email as string;
        session.user.image = token.picture as string | null | undefined;
        session.user.saldoRinCoin = token.saldoRinCoin as number;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
