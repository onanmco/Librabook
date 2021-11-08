import {RedisClientType} from "redis/dist/lib/client";
import {SESSION_EXPIRE_AFTER_SECONDS} from "../../app/constants/Session";
import * as utils from "../../utils";
import * as datefns from "date-fns";

export class Client {
  private connection: RedisClientType<any, any>;

  constructor(connection: RedisClientType<any, any>) {
    this.connection = connection;
  }

  public async createAndGetNewToken(userId, expireAfterSeconds = SESSION_EXPIRE_AFTER_SECONDS): Promise<string> {
    const token = utils.getRandomString();

    const tokensOfUser = `users:${userId}:tokens`;
    await this.connection.zRem(tokensOfUser, token);
    await this.connection.zAdd(tokensOfUser, {
      score: datefns.getUnixTime(datefns.addSeconds(new Date(), SESSION_EXPIRE_AFTER_SECONDS)),
      value: token
    });

    const individualToken = `tokens:${token}:user_id`;
    await this.connection.set(individualToken, String(userId), {
      EX: expireAfterSeconds
    });
    return token;
  }

  public async getUserIdByToken(token): Promise<string> {
    return await this.connection.get(`tokens:${token}:user_id`);
  }

  public async extendTokenExpiration(userId, token, expireAfterSeconds = SESSION_EXPIRE_AFTER_SECONDS): Promise<void> {
    const tokensOfUser = `users:${userId}:tokens`;
    await this.connection.zRem(tokensOfUser, token);
    await this.connection.zAdd(tokensOfUser, {
      score: datefns.getUnixTime(datefns.addSeconds(new Date(), SESSION_EXPIRE_AFTER_SECONDS)),
      value: token
    });

    const individualToken = `tokens:${token}:user_id`;
    await this.connection.del(individualToken);
    await this.connection.set(individualToken, String(userId), {
      EX: expireAfterSeconds
    });
  }

  public async removeToken(userId, token) {
    const tokensOfUser = `users:${userId}:tokens`;
    const individualToken = `tokens:${token}:user_id`;

    await this.connection.zRem(tokensOfUser, token);
    await this.connection.del(individualToken);
  }

  public async removeAllTokens(userId) {
    const tokensOfUser = `users:${userId}:tokens`;
    const tokens = await this.connection.zRange(tokensOfUser, 0, -1);
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      await this.connection.zRem(tokensOfUser, token);
      await this.connection.del(`tokens:${token}:user_id`);
    }
  }

  public async removeExpiredTokens(userId) {
    const tokensOfUser = `users:${userId}:tokens`;
    const tokens = await this.connection.zRangeByScore(
      tokensOfUser,
      0,
      datefns.getUnixTime(new Date())
    );
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      await this.connection.zRem(tokensOfUser, token);
      await this.connection.del(`tokens:${token}:user_id`);
    }
  }

}