import { Request } from 'express';
import {ApiToken} from "../../app/entities/ApiToken";


export interface RequestWithAuthProp extends Request {
  auth?: {
    token?: ApiToken
  }
}