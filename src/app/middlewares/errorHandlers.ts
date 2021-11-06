import {
  Request,
  Response,
  NextFunction
} from 'express';
import Errors from "../constants/Errors";
import {StatusCodes} from "../constants/StatusCodes";
import {CustomError} from "../../core/types/CustomError";

export function generalErrorHandler(
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const response = {
    timestamp: Date.now(),
    message: err.digest ? err.digest : Errors.UNKNOWN_ERROR
  } as Record<string, any>
  
  let code = StatusCodes.HTTP_INTERNAL_SERVER_ERROR;
  
  if (err.code) {
    code = err.code;
  }
  
  if (err.details) {
    response.details = err.details;
  }

  console.log(err);
  
  res
    .status(code)
    .json(response);
}