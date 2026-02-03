export type UserResponse = {
  id: string;
  email: string;
  name: string;
  profileImage: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class UserResponseDto {
  id: string;
  email: string;
  name: string;
  profileImage: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(user: UserResponse) {
    this.id = user.id;
    this.email = user.email;
    this.name = user.name;
    this.profileImage = user.profileImage;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }

  static fromArray(users: UserResponse[]): UserResponseDto[] {
    return users.map((user) => new UserResponseDto(user));
  }
}

export class AuthTokensResponseDto {
  accessToken: string;
  refreshToken: string;

  constructor(tokens: { accessToken: string; refreshToken: string }) {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
  }
}

export class GoogleOAuthUrlResponseDto {
  url: string;

  constructor(url: string) {
    this.url = url;
  }
}
