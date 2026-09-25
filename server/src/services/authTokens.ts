import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { IUser } from '../models/User';

export const generateToken = (user: IUser): string => {
  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
    },
    ENV.JWT_SECRET,
    {
      expiresIn: '7d',
    }
  );
};

export const setAuthCookie = (res: Response, token: string) => {
  const cookieOptions = {
    httpOnly: true,
    secure: ENV.isProduction,
    sameSite: ENV.isProduction ? ('none' as const) : ('lax' as const),
    maxAge: ENV.COOKIE_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
    path: '/',
  };

  res.cookie('token', token, cookieOptions);
};

export const clearAuthCookie = (res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: ENV.isProduction,
    sameSite: ENV.isProduction ? ('none' as const) : ('lax' as const),
    path: '/',
  });
};
