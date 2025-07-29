// Next.js API route for authentication
import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../../lib/mongodb';
import { register, login } from '../../../backend/src/controllers/authController';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  const { action } = req.query;

  if (req.method === 'POST') {
    if (action === 'register') {
      return await register(req as any, res as any);
    } else if (action === 'login') {
      return await login(req as any, res as any);
    }
  }

  res.status(405).json({ message: 'Method not allowed' });
}
