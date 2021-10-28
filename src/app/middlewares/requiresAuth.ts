import { Response, NextFunction } from 'express';
import * as utils from '../../utils/index';
import Errors from "../constants/Errors";
import { ApiToken } from "../entities/ApiToken";
import { RequestWithAuthProp } from "../../core/types/RequestWithAuthProp";
import { StatusCodes } from '../constants/StatusCodes';

export async function requiresAuth(req: RequestWithAuthProp, res: Response, next: NextFunction) {
  const capturedAt = Date.now();
  const bearerToken = utils.getBearerToken(req);

  if (!bearerToken) {
    return res.sendStatus(StatusCodes.HTTP_UNAUTHORIZED);
  }

  const tokenFound = await ApiToken.findOne({
    where: {
      token: bearerToken
    },
    join: {
      alias: 'token',
      leftJoinAndSelect: {
        'user': 'token.user'
      }
    }
  });

  if (!tokenFound) {
    return res.sendStatus(StatusCodes.HTTP_UNAUTHORIZED);
  }

  if (capturedAt > tokenFound.expires_at.getTime()) {
    return res.status(StatusCodes.HTTP_UNAUTHORIZED).json({
      errors: [Errors.SESSION_EXPIRED]
    });
  }

  req.auth = {
    token: tokenFound
  };

  next();
}