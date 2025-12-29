import jwt, { JwtPayload } from "jsonwebtoken";

// AccessTokenPayload Type
export interface AccessTokenPayload {
  userId: number;
  email: string;
}

// 토큰 만료시간 상수 설정
const ACCESS_TOKEN_EXPIRES_IN = "2h";
const REFRESH_TOKEN_EXPIRES_IN = "30d";

// 환경변수 로딩
const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

// 런타임 안정성 체크
if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error("JWT_SECRET or JWT_REFRESH_SECRET is not defined");
}

// access token 생성
export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
}

// access token 검증
export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

  return {
    userId: decoded.userId as number,
    email: decoded.email as string,
  };
}

// refresh token 생성
export function signRefreshToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    algorithm: "HS256",
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });
}

// refresh token 검증
export function verifyRefreshToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;

  return {
    userId: decoded.userId as number,
    email: decoded.email as string,
  };
}
