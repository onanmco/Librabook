import {NextFunction, Response} from 'express';
import {
  REST_CONTROLLER,
  HTTP_GET,
  USE_MIDDLEWARE
} from '../../core/decorators';
import { StatusCodes } from '../constants/StatusCodes';
import {RequestWithAuthProp} from "../../core/types/RequestWithAuthProp";
import { requiresAuth } from "../middlewares/requiresAuth";

@REST_CONTROLLER('/check')
class HealthCheckController {
  /**
   * Health Check
   * 
   * @param {Request} req 
   * @param {Response} res 
   */
  @HTTP_GET('/')
  @USE_MIDDLEWARE(requiresAuth)
  public async checkAuthStatus(req: RequestWithAuthProp, res: Response, next: NextFunction) {
    try {
      res.sendStatus(StatusCodes.HTTP_OK);
    } catch (err) {
      next(err);
    }
  }
}