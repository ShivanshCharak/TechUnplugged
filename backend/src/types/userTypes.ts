
export interface UserBindings {
  DATABASE_URL: string;
  JWT_SECRET: string;
  ACCESS_TOKEN_SECRET: string;
  REFRESH_TOKEN_SECRET: string;
}

export interface UserVariables {
  userId: string;
}

export interface SignupInput {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

export interface SigninInput {
  email: string;
  password: string;
}

export interface UpdateProfileInput {
  avatar?: string;
  intro?: string;
  tech?: string[];
}

export interface JWTPayload {
  id: string;
  isPremium: boolean;
  exp: number;
}

export interface RefreshTokenPayload {
  jti: string;
  userId: string;
  exp: number;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  isPremium: boolean;
}
