import * as redis from 'redis';
import * as dotenv from 'dotenv';
import { RedisClientType } from 'redis/dist/lib/client';
dotenv.config();

export class RedisConnector {
  private static connection: RedisClientType<any, any>;
  public static async getConnection(): Promise<RedisClientType<any, any>> {
    if (! this.connection) {
      this.connection = redis.createClient({
        url: `redis://:${process.env.REDIS_PASS}@${process.env.REDIS_HOST}:6379`
      });
      await this.connection.connect();
    }
    return this.connection;
  }
}