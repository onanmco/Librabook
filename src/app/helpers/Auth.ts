import { Request } from "express";
import { StatusCodes } from "../constants/StatusCodes";
import * as utils from '../../utils';
import Errors from "../constants/Errors";
import { RedisConnector } from "../../libs/redis/RedisConnector";
import { User } from "../entities/User";
import { SESSION_EXPIRE_AFTER_SECONDS } from "../constants/Session";
import { Client as RedisClient } from "../../libs/redis/Client";

/**
 * Auth class is used to decompose the logic that determines if requested user is auth or not.
 */
export class Auth {
  private request: Request;
  private status: StatusCodes;
  private errors: string[];
  private pristine: boolean;
  private capturedAt: number;
  private authUser: User;

  constructor(request: Request) {
    this.request = request;
    this.status = StatusCodes.HTTP_UNAUTHORIZED;
    this.errors = [];
    this.pristine = true;
    this.capturedAt = Date.now();
    this.authUser = null;
  }

  public async isAuth(): Promise<boolean> {
    if (!this.pristine) {
      return this.status != StatusCodes.HTTP_UNAUTHORIZED;
    }
    this.pristine = false;

    const bearerToken = utils.getBearerToken(this.request);

    if (! bearerToken) {
      this.status = StatusCodes.HTTP_UNAUTHORIZED;
      return false;
    }

    const connection = await RedisConnector.getConnection();
    const redis = new RedisClient(connection);
    const authUserId = await redis.getUserIdByToken(bearerToken);
  
    if (!authUserId) {
      this.status = StatusCodes.HTTP_UNAUTHORIZED;
      return false;
    }

    await redis.removeExpiredTokens(authUserId);
    await redis.extendTokenExpiration(authUserId, bearerToken);

    const authUser = await User.findOne({
      where: {
        id: authUserId
      },
      join: {
        alias: 'user',
        leftJoinAndSelect: {
          'group': 'user.group',
          'roles': 'group.roles'
        }
      }
    });

    if (!authUser) {
      this.status = StatusCodes.HTTP_UNAUTHORIZED;
      return false;
    }

    this.authUser = authUser;
    return true;
  }

  public getStatus(): StatusCodes {
    return this.status;
  }

  public getErrors(): string[] {
    return this.errors;
  }

  public getAuthUser(): User {
    return this.authUser;
  }
}