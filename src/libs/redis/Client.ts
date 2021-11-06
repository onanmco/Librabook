import * as redis from 'redis';
import * as dotenv from 'dotenv';
import { RedisClientType } from 'redis/dist/lib/client';
dotenv.config();

export class Client {
  public static getInstance(): RedisClientType<any, any> {
    return redis.createClient({
      password: process.env.REDIS_PASS
    });
  }
}