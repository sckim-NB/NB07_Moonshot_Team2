import { env } from '../lib/env.js';
import {
  EmailAlreadyExistsError,
  InvalidCredentialsError,
  InvalidRequestError,
  TokenExpiredError,
} from '../lib/errors.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../lib/jwt.js';
import { comparePassword, hashPassword } from '../lib/password.js';
import * as userRepository from '../repositories/user.repository.js';
import { LoginInput, RegisterInput } from '../schemas/auth.schema.js';
import {
  RegisterRequestDto,
  LoginRequestDto,
  RefreshTokenRequestDto,
} from '../classes/dtos/auth.request.dto.js';
import {
  UserResponseDto,
  AuthTokensResponseDto,
  GoogleOAuthUrlResponseDto,
} from '../classes/dtos/auth.response.dto.js';

export const register = async (data: RegisterInput): Promise<UserResponseDto> => {
  // DTO로 변환
  const dto = new RegisterRequestDto(data);

  // 이메일 중복 체크 (정규화된 이메일 사용)
  const existingUser = await userRepository.findByEmail(dto.normalizeEmail());
  if (existingUser) {
    throw new EmailAlreadyExistsError();
  }

  // 비밀번호 해시
  const hashedPassword = await hashPassword(dto.password);

  // 유저 생성
  const user = await userRepository.create({
    email: dto.normalizeEmail(),
    name: dto.name,
    password: hashedPassword,
    profileImage: dto.profileImage || null,
  });

  // Response DTO로 변환하여 반환 (password 자동 제외)
  return new UserResponseDto(user);
};

export const login = async (data: LoginInput): Promise<AuthTokensResponseDto> => {
  // DTO로 변환
  const dto = new LoginRequestDto(data);

  // 유저 조회 (정규화된 이메일 사용)
  const user = await userRepository.findByEmail(dto.normalizeEmail());
  if (!user) {
    throw new InvalidCredentialsError();
  }

  // 구글 유저는 이메일/비밀번호 로그인 불가
  if (user.provider === 'GOOGLE') {
    throw new InvalidCredentialsError();
  }

  // 비밀번호 검증
  if (!user.password) {
    throw new InvalidCredentialsError();
  }

  const isPasswordValid = await comparePassword(dto.password, user.password);
  if (!isPasswordValid) {
    throw new InvalidCredentialsError();
  }

  // 토큰 발급
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  // Response DTO로 변환하여 반환
  return new AuthTokensResponseDto({
    accessToken,
    refreshToken,
  });
};

export const refreshTokens = async (refreshToken: string): Promise<AuthTokensResponseDto> => {
  // DTO로 변환
  const dto = new RefreshTokenRequestDto(refreshToken);

  // 토큰 검증
  const result = verifyRefreshToken(dto.refreshToken);

  if (!result.valid) {
    if (result.expired) {
      throw new TokenExpiredError();
    }
    throw new InvalidRequestError();
  }

  // 새 토큰 발급
  const userId = result.payload!.userId;
  const newAccessToken = generateAccessToken(userId);
  const newRefreshToken = generateRefreshToken(userId);

  // Response DTO로 변환하여 반환
  return new AuthTokensResponseDto({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });
};

export const initiateGoogleOAuth = (): GoogleOAuthUrlResponseDto => {
  const googleAuthUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${env.GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(env.GOOGLE_CALLBACK_URL)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent('openid email profile')}&` +
    `access_type=offline`;

  // Response DTO로 변환하여 반환
  return new GoogleOAuthUrlResponseDto(googleAuthUrl);
};

export const handleGoogleCallback = async (code: string): Promise<AuthTokensResponseDto> => {
  // 1. code로 Google에서 access_token 획득
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: env.GOOGLE_CALLBACK_URL,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenResponse.ok) {
    throw new InvalidRequestError();
  }

  const tokenData = (await tokenResponse.json()) as { access_token: string };
  const googleAccessToken = tokenData.access_token;

  // 2. access_token으로 사용자 정보 조회
  const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${googleAccessToken}`,
    },
  });

  if (!userInfoResponse.ok) {
    throw new InvalidRequestError();
  }

  const userInfo = (await userInfoResponse.json()) as {
    email: string;
    name?: string;
    picture?: string;
  };

  // 3. 유저 찾기 또는 생성
  const user = await userRepository.findOrCreateByGoogle({
    email: userInfo.email,
    name: userInfo.name || userInfo.email.split('@')[0],
    profileImage: userInfo.picture || null,
  });

  // 4. 토큰 발급
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  // Response DTO로 변환하여 반환
  return new AuthTokensResponseDto({
    accessToken,
    refreshToken,
  });
};
