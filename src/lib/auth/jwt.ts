import { SignJWT, jwtVerify, type JWTPayload as JosePayload } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT(payload as unknown as JosePayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN ?? "7d")
    .sign(secret);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      userId: payload["userId"] as string,
      email: payload["email"] as string,
      role: payload["role"] as string,
    };
  } catch {
    return null;
  }
}