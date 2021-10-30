import { Request } from "express";
import { StatusCodes } from "../constants/StatusCodes";
import * as utils from '../../utils';
import { ApiToken } from "../entities/ApiToken";
import Errors from "../constants/Errors";

/**
 * Auth class is used to decompose the logic that determines if requested user is auth or not.
 */
export class Auth {
  private request: Request;
  private status: StatusCodes;
  private errors: string[];
  private pristine: boolean;
  private capturedAt: number;
  private tokenOfTheAuthUser: ApiToken;

  constructor(request: Request) {
    this.request = request;
    this.status = StatusCodes.HTTP_UNAUTHORIZED;
    this.errors = [];
    this.pristine = true;
    this.capturedAt = Date.now();
    this.tokenOfTheAuthUser = null;
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

    const tokenFound = await ApiToken.findOne({
      where: {
        token: bearerToken
      },
      join: {
        alias: 'token',
        leftJoinAndSelect: {
          'user': 'token.user',
          'group': 'user.group',
          'roles': 'group.roles'
        }
      }
    });
  
    if (!tokenFound) {
      this.status = StatusCodes.HTTP_UNAUTHORIZED;
      return false;
    }

    if (this.capturedAt > tokenFound.expires_at.getTime()) {
      this.status = StatusCodes.HTTP_UNAUTHORIZED;
      this.errors = [Errors.SESSION_EXPIRED];
      return false;
    }

    this.tokenOfTheAuthUser = tokenFound;
    return true;
  }

  public getStatus(): StatusCodes {
    return this.status;
  }

  public getErrors(): string[] {
    return this.errors;
  }

  public getAuthToken(): ApiToken {
    return this.tokenOfTheAuthUser;
  }
}