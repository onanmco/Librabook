import * as redis from 'redis';
import * as dotenv from 'dotenv';
import { RedisClientType } from 'redis/dist/lib/client';
dotenv.config();

export class Client {
  private static connection: RedisClientType<any, any>;
  public static async getConnection(): Promise<RedisClientType<any, any>> {
    if (! this.connection) {
      this.connection = redis.createClient({
        url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
        password: process.env.REDIS_PASS
      });
      await this.connection.connect();
    }
    return this.connection;
  }
}