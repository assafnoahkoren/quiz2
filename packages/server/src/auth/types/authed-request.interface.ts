import { Request } from 'express';
import { UserPayload } from './jwt-payload.interface'; // Adjust path if needed

export interface AuthedRequest extends Request {
  user: UserPayload;
} 