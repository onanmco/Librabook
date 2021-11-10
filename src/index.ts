import express = require('express');
import { Router } from './core/Router';
import { Loader } from './core/Loader';
import path from 'path';
import "reflect-metadata";
import { createConnection } from "typeorm";
import { respond404 as respondWith404IfNoRouteMatches } from './app/middlewares/404';
import * as dotenv from 'dotenv';
import { DBSeeder } from './nonhttp/DBSeeder';
import {generalErrorHandler} from "./app/middlewares/errorHandlers";
import {RedisConnector} from "./libs/redis/RedisConnector";
import * as swagger from "swagger-ui-express";
import * as swaggerDocument from "./swagger.json";

dotenv.config();
let port: string = process.env.APP_PORT || '8000';
const app = express();
const controllerLoader = new Loader(path.join(__dirname + '/app/controllers'));
controllerLoader.loadControllers();

createConnection().then(async () => {
  if (!!parseInt(process.env.DB_SEED)) {
    await DBSeeder.seed();
  }
  app.use("/documentation", swagger.serve, swagger.setup(swaggerDocument))
  app.use(Router.getInstance());
  app.use(respondWith404IfNoRouteMatches);
  app.use(generalErrorHandler);

  app.listen(port, () => {
    console.log('Local server is up on port ' + port);
  });
}).catch(error => console.log(error));
