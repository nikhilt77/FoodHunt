// Vercel serverless function for authentication
import { Request, Response } from 'express';
import { connectDB } from '../../lib/mongodb';
import { register, login, getProfile } from '../../backend/src/controllers/authController';

// Connect to database
connectDB();

export default async function handler(req: Request, res: Response) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { action } = req.query;

  try {
    switch (req.method) {
      case 'POST':
        if (action === 'register') {
          return await register(req, res);
        } else if (action === 'login') {
          return await login(req, res);
        }
        break;
      case 'GET':
        if (action === 'profile') {
          return await getProfile(req, res);
        }
        break;
      default:
        res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
}
