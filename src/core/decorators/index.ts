import { RequestMethods } from "../constants/RequestMethods";
import { ControllerDecorator } from "./ControllerDecorator";
import { MiddlewareBinder } from "./MiddlewareBinder";
import { RouteBinder } from "./RouteBinder";

export const HTTP_GET = RouteBinder.bind(RequestMethods.get);
export const HTTP_POST = RouteBinder.bind(RequestMethods.post);
export const HTTP_PUT = RouteBinder.bind(RequestMethods.put);
export const HTTP_DEL = RouteBinder.bind(RequestMethods.delete);

export const USE_MIDDLEWARE = MiddlewareBinder.bind();

export const REST_CONTROLLER = ControllerDecorator.wireUpTheEndpoint();