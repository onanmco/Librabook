import { Request, Response } from 'express';
import { StatusCodes } from '../constants/StatusCodes';

export function respond404(req: Request, res: Response) {
  res.sendStatus(StatusCodes.HTTP_NOT_FOUND);
}