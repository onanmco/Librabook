import 'reflect-metadata';
import { Middleware } from '../types/Middleware';
import { RequestHandlerDescriptor } from '../types/RequestHandlerDescriptor';

export class MiddlewareBinder {
  public static bind() {
    return function use(middleware: Middleware) {
      return function (target: any, key: string, desc: RequestHandlerDescriptor) {
        const existingMiddlewares = Reflect.getMetadata('middlewares', target[key]) || [];
        Reflect.defineMetadata('middlewares', [...existingMiddlewares, middleware], target[key]);
      }
    }
  }
};