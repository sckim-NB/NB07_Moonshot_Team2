// src/app/api/auth/google/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const accessToken = searchParams.get('accessToken');
  const refreshToken = searchParams.get('refreshToken');

  if (!accessToken || !refreshToken) {
    return NextResponse.redirect(new URL('/login?error=missing_tokens', request.url));
  }

  // 리다이렉트할 응답 객체 생성
  const response = NextResponse.redirect(new URL('/projects', request.url));

  // 응답 헤더에 직접 쿠키 주입 (shared/auth의 설정을 수동으로 적용)
  response.cookies.set('access-token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });

  response.cookies.set('refresh-token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });

  return response;
}