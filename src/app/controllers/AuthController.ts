import bodyParser from 'body-parser';
import { Request, Response } from 'express';
import {
  HTTP_GET,
  HTTP_POST,
  USE_MIDDLEWARE,
  REST_CONTROLLER
} from '../../core/decorators';
import * as Yup from 'yup';
import bcrypt from 'bcrypt';
import * as utils from '../../utils';
import * as datefns from 'date-fns';
import { requiresAuth } from '../middlewares/requiresAuth';
import { RequestWithAuthProp } from '../../core/types/RequestWithAuthProp';
import Errors from "../constants/Errors";
import { User } from "../entities/User";
import { ApiToken } from "../entities/ApiToken";
import { SESSION_EXPIRE_AFTER_HOURS } from '../constants/Session';

@REST_CONTROLLER('/')
class AuthController {
  @HTTP_POST('/login')
  @USE_MIDDLEWARE(bodyParser.json())
  public async login(req: Request, res: Response) {
    const schema = Yup.object({
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
    });

    try {
      schema.validateSync(req.body, { abortEarly: false })
    } catch ({ errors }) {
      return res.status(400).json({ errors: errors });
    }

    const existing_user = await User.findOne({ where: { email: req.body.email } });

    if (!existing_user) {
      return res.status(400).json({ errors: [Errors.ACCOUNT_NOT_FOUND] });
    }

    if (!bcrypt.compareSync(req.body.password, existing_user.password_hash)) {
      return res.status(400).json({ errors: [Errors.INVALID_CREDENTIALS] });
    }

    const created_at = new Date();

    const api_token = await ApiToken.create({
      user_id: existing_user.id,
      token: utils.getRandomString(),
      created_at: created_at,
      expires_at: datefns.addHours(created_at, SESSION_EXPIRE_AFTER_HOURS)
    }).save();

    const payload = await ApiToken.findOne({
      where: {
        token: api_token.token
      },
      join: {
        alias: 'token',
        leftJoinAndSelect: {
          'user': 'token.user'
        }
      }
    });

    res.status(200).json(payload);
  }

  @HTTP_GET('/logout')
  @USE_MIDDLEWARE(requiresAuth)
  public async logout(req: RequestWithAuthProp, res: Response) {
    await req.auth.token.remove();
    res.sendStatus(200);
  };
}

