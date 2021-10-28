import { Request, Response } from 'express';

export function respond404(req: Request, res: Response) {
  res.sendStatus(404);
}