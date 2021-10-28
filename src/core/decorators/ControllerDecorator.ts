import 'reflect-metadata';
import { RequestHandler } from 'express';
import { RequestMethods } from "../constants/RequestMethods";
import { Router } from '../Router';
import { Middleware } from '../types/Middleware';

export class ControllerDecorator {
  public static wireUpTheEndpoint() {
    return (prefix: string) => {
      return (target: Function) => {
        for (let methodIdentifier in target.prototype) {
          const method: RequestMethods = this.getMethod(target.prototype[methodIdentifier])
          const path: string = this.sanitizePath(prefix + this.getPath(target.prototype[methodIdentifier]));
          const middlewares: Middleware[] = this.getMiddlewares(target.prototype[methodIdentifier]);
          this.registerHandler(method, path, middlewares, target.prototype[methodIdentifier]);
        }
      }
    }
  }

  private static getMethod(methodDefinition: RequestHandler): RequestMethods {
    return Reflect.getMetadata('method', methodDefinition);
  }

  private static sanitizePath(path: string) {
    return path.replace(/\/+/g, '/');
  } 

  private static getPath(methodDefinition: RequestHandler): RequestMethods {
    return Reflect.getMetadata('path', methodDefinition)
  }

  private static getMiddlewares(methodDefinition: RequestHandler): Middleware[] {
    return Reflect.getMetadata('middlewares', methodDefinition) || [];
  }

  private static registerHandler(method: RequestMethods, path: string, middlewares: any[], handler: RequestHandler) {
    Router.getInstance()[method](path, [...middlewares], handler);
  }
}