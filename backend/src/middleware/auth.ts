import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: { userId: string; email: string };
}

function resolveToken(req: Request): string | undefined {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    return header.slice(7);
  }

  if (req.method === "GET" && typeof req.query.token === "string") {
    return req.query.token;
  }

  return undefined;
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const token = resolveToken(req);
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ error: "JWT secret not configured" });
  }

  try {
    const payload = jwt.verify(token, secret) as {
      userId: string;
      email: string;
    };
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
