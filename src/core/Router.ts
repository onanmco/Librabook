import { Router as ExpressRouter } from 'express';

export class Router {
  private static instance: ExpressRouter;

  public static getInstance(): ExpressRouter {
    if (!this.instance) {
      this.instance = ExpressRouter();
    }

    return this.instance;
  }
}