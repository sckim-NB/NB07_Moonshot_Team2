export class RegisterRequestDto {
  email: string;
  password: string;
  name: string;
  profileImage?: string | null;

  constructor(data: {
    email: string;
    password: string;
    name: string;
    profileImage?: string | null;
  }) {
    this.email = data.email;
    this.password = data.password;
    this.name = data.name;
    this.profileImage = data.profileImage;
  }

  normalizeEmail(): string {
    return this.email.toLowerCase().trim();
  }
}

export class LoginRequestDto {
  email: string;
  password: string;

  constructor(data: { email: string; password: string }) {
    this.email = data.email;
    this.password = data.password;
  }

  normalizeEmail(): string {
    return this.email.toLowerCase().trim();
  }
}

export class RefreshTokenRequestDto {
  refreshToken: string;

  constructor(refreshToken: string) {
    this.refreshToken = refreshToken;
  }
}

export class GoogleCallbackRequestDto {
  code: string;

  constructor(code: string) {
    this.code = code;
  }
}
