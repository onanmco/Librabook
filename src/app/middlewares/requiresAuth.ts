import { Response, NextFunction } from 'express';
import { RequestWithAuthProp } from "../../core/types/RequestWithAuthProp";
import { Auth } from '../helpers/Auth';

export async function requiresAuth(req: RequestWithAuthProp, res: Response, next: NextFunction) {
  const authAttempt = new Auth(req);

  if (await authAttempt.isAuth() !== true) {
    const errors = authAttempt.getErrors();
    if (errors.length > 0) {
      return res.status(authAttempt.getStatus()).json({
        errors: errors
      });
    }
    return res.sendStatus(authAttempt.getStatus());
  }

  req.auth = {
    token: authAttempt.getAuthToken()
  };

  next();
}