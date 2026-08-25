import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  // Penanganan fallback pembacaan session token langsung dari cookies request
  const rawToken = req.cookies.get('next-auth.session-token')?.value || req.cookies.get('__Secure-next-auth.session-token')?.value;
  const isAuthenticated = !!token || !!rawToken;

  const { pathname } = req.nextUrl;
  const isAuthPage = pathname.startsWith('/masuk');
  const isAdminPage = pathname.startsWith('/admin');
  const isSiswaPage = pathname.startsWith('/siswa');

  // 1. Pengguna belum login mengakses /admin atau /siswa dialihkan ke /masuk
  if (!isAuthenticated && (isAdminPage || isSiswaPage)) {
    return NextResponse.redirect(new URL('/masuk', req.url));
  }

  if (isAuthenticated) {
    const peran = token?.peran; // token menyimpan properti peran pengguna
    
    // 2. Pengguna yang sudah login dan membuka /masuk dialihkan ke dashboard sesuai perannya
    if (isAuthPage) {
      if (peran === 'ADMIN_PENGAJAR') {
        return NextResponse.redirect(new URL('/admin/pengaturan', req.url));
      } else {
        return NextResponse.redirect(new URL('/siswa/kursus', req.url));
      }
    }

    // 3. Pengguna login dengan peran SISWA yang mencoba membuka /admin dialihkan ke /siswa/kursus
    if (isAdminPage && peran !== 'ADMIN_PENGAJAR') {
      return NextResponse.redirect(new URL('/siswa/kursus', req.url));
    }

    // 4. Pengguna login dengan peran ADMIN_PENGAJAR yang mencoba membuka /siswa dialihkan ke /admin/pengaturan
    if (isSiswaPage && peran === 'ADMIN_PENGAJAR') {
      return NextResponse.redirect(new URL('/admin/pengaturan', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/siswa/:path*', '/masuk'],
};
