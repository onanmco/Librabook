import { RequestHandler } from "express";

export interface RequestHandlerDescriptor extends PropertyDescriptor {
  value?: RequestHandler;
}