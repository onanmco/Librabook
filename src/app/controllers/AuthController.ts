import bodyParser from 'body-parser';
import {NextFunction, Request, Response} from 'express';
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
import { StatusCodes } from '../constants/StatusCodes';
import {CustomErrorBuilder} from "../../core/types/CustomErrorBuilder";
import { Client } from '../../libs/redis/Client';
import { SESSION_EXPIRE_AFTER_SECONDS } from '../constants/Session';

/**
 * Class AuthController
 * Responsible for processing and responding to requests, related to login and logout operations.
 */
@REST_CONTROLLER('/')
class AuthController {
  /**
   * This method creates a session based api token if the attempted user's credentials are correct.
   * Users can make requests to protected routes via this token.
   * Auth token must be attached to HTTP Authorization header with Bearer prefix.
   * 
   * @param req 
   * @param res 
   * @returns 
   */
  @HTTP_POST('/login')
  @USE_MIDDLEWARE(bodyParser.json())
  public async login(req: Request, res: Response, next: NextFunction) {
    try {
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
        new CustomErrorBuilder(Errors.VALIDATION_ERROR).details(errors).dispatch();
      }

      const existing_user = await User.findOne({
        where: {
          email: req.body.email
        },
        join: {
          alias: 'user',
          leftJoinAndSelect: {
            'group': 'user.group',
            'roles': 'group.roles'
          }
        }
      });

      if (!existing_user) {
        new CustomErrorBuilder(Errors.ACCOUNT_NOT_FOUND).dispatch();
      }

      if (!bcrypt.compareSync(req.body.password, existing_user.password_hash)) {
        new CustomErrorBuilder(Errors.INVALID_CREDENTIALS).dispatch();
      }

      const redis = Client.getInstance();
      await redis.connect();
      const token = utils.getRandomString();
      await redis.set(`session_id:${token}`, String(existing_user.id), {
        EX: SESSION_EXPIRE_AFTER_SECONDS
      });

      res
      .status(StatusCodes.HTTP_OK)
      .json({
        token: token,
        user: existing_user
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Logges out the user from current session by removing the provided bearer token.
   * 
   * @param {RequestWithAuthProp} req 
   * @param {Response} res 
   */
  @HTTP_GET('/logout')
  @USE_MIDDLEWARE(requiresAuth)
  public async logout(req: RequestWithAuthProp, res: Response, next: NextFunction) {
    try {
      const token =  req.auth.token;
      try {
        const redis = Client.getInstance();
        await redis.connect();
        redis.del(`session_id:${token}`);
      } catch (err) {}
      res.sendStatus(StatusCodes.HTTP_OK);
    } catch (err) {
      next(err);
    }
  };
}

