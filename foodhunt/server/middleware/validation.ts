import { Request, Response, NextFunction } from 'express';

export const validateRegistration = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, rollNumber } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ 
      success: false, 
      message: 'Name must be at least 2 characters long' 
    });
  }

  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please provide a valid email address' 
    });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ 
      success: false, 
      message: 'Password must be at least 6 characters long' 
    });
  }

  if (!rollNumber || rollNumber.trim().length < 1) {
    return res.status(400).json({ 
      success: false, 
      message: 'Roll number is required' 
    });
  }

  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email and password are required' 
    });
  }

  next();
};
