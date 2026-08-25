import NextAuth, { DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { PeranPengguna } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      nama: string;
      email: string;
      peran: PeranPengguna;
      saldoRinCoin: number;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    nama: string;
    email: string;
    peran: PeranPengguna;
    saldoRinCoin: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    nama: string;
    email: string;
    peran: PeranPengguna;
    saldoRinCoin: number;
  }
}
