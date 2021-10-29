import express = require('express');
import { Router } from './core/Router';
import { Loader } from './core/Loader';
import path from 'path';
import "reflect-metadata";
import { createConnection } from "typeorm";
import { respond404 as respondWith404IfNoRouteMatches } from './app/middlewares/404';
import * as dotenv from 'dotenv';
import { DBSeeder } from './nonhttp/DBSeeder';

dotenv.config();
let port: string = process.env.APP_PORT || '8000';
const app = express();
const controllerLoader = new Loader(path.join(__dirname + '/app/controllers'));
controllerLoader.loadControllers();

createConnection().then(async () => {
  if (!!parseInt(process.env.DB_SEED)) {
    await DBSeeder.seed();
  }
  app.use(Router.getInstance());
  app.use(respondWith404IfNoRouteMatches);

  app.listen(port, () => {
    console.log('Local server is up on port ' + port);
  });
}).catch(error => console.log(error));
