import { Response, NextFunction } from 'express';
import { RequestWithAuthProp } from "../../core/types/RequestWithAuthProp";
import { Auth } from '../helpers/Auth';
import {CustomErrorBuilder} from "../../core/types/CustomErrorBuilder";
import Errors from "../constants/Errors";
import {StatusCodes} from "../constants/StatusCodes";

export async function requiresAuth(req: RequestWithAuthProp, res: Response, next: NextFunction) {
  const authAttempt = new Auth(req);

  if (await authAttempt.isAuth() !== true) {
    const error = new CustomErrorBuilder(Errors.UNAUTHORIZED_ACCESS)
      .status(StatusCodes.HTTP_UNAUTHORIZED);

    const details = authAttempt.getErrors();
    if (details.length > 0) {
      error.details(details)
    }
    
    next(error.get());
  }

  req.auth = {
    token: authAttempt.getAuthToken()
  };

  next();
}