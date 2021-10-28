import { Response, NextFunction } from 'express';
import * as utils from '../../utils/index';
import Errors from "../constants/Errors";
import { ApiToken } from "../entities/ApiToken";
import { RequestWithAuthProp } from "../../core/types/RequestWithAuthProp";

export async function requiresAuth(req: RequestWithAuthProp, res: Response, next: NextFunction) {
  const capturedAt = Date.now();
  const bearerToken = utils.getBearerToken(req);

  if (!bearerToken) {
    return res.sendStatus(401);
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
    return res.sendStatus(401);
  }

  if (capturedAt > tokenFound.expires_at.getTime()) {
    return res.status(401).json({
      errors: [Errors.SESSION_EXPIRED]
    });
  }

  req.auth = {
    token: tokenFound
  };

  next();
}