import { Request } from 'express';
import { User } from '../../app/entities/User';
export interface RequestWithAuthProp extends Request {
  auth?: {
    token?: string,
    user?: User
  }
}