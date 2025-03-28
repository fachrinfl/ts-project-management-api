import { Request, Response } from 'express';
import { loginUser, registerUser } from './auth.service';
import { LoginSchema, RegisterSchema } from './auth.validation';

export const register = async (req: Request, res: Response) => {
  try {
    const parsed = RegisterSchema.safeParse(req.body);

    if (!parsed.success) {
      const errors = parsed.error.format();
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    const user = await registerUser(parsed.data);

    res.status(201).json({
      message: 'User registered successfully',
      user,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const parsed = LoginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res
        .status(400)
        .json({ message: 'Validation failed', errors: parsed.error.format() });
    }

    const user = await loginUser(parsed.data);

    res.status(200).json({
      message: 'Login successful',
      user,
    });
  } catch (error: any) {
    res.status(401).json({ message: error.message || 'Login failed' });
  }
};
