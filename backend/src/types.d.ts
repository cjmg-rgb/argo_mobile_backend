import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

interface IRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    credits: number;
    department: {
      id: string;
      name: string;
    };
    role: 'admin' | 'user' | 'driver';
  };
}

interface IAccessTokenPayload extends JwtPayload {
  userId: string;
}
