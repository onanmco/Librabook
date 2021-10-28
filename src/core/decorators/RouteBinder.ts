import 'reflect-metadata';
import { RequestMethods } from '../constants/RequestMethods';
import { RequestHandlerDescriptor } from '../types/RequestHandlerDescriptor';

export class RouteBinder {
  public static bind(method: RequestMethods): Function {
    return function (path: string) {
      return function (target: any, key: string, desc: RequestHandlerDescriptor) {
        Reflect.defineMetadata('method', method, target[key]);
        Reflect.defineMetadata('path', path, target[key]);
      }
    }
  }
}