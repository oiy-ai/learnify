import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Redis as IORedis, RedisOptions } from 'ioredis';

import { Config } from '../config';

class Redis extends IORedis implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(this.constructor.name);

  errorHandler = (err: Error) => {
    this.logger.error(err);
  };

  onModuleInit() {
    this.on('error', this.errorHandler);
  }

  onModuleDestroy() {
    this.disconnect();
  }

  override duplicate(override?: Partial<RedisOptions>): IORedis {
    const client = super.duplicate(override);
    client.on('error', this.errorHandler);
    return client;
  }

  assertValidDBIndex(db: number) {
    if (db && db > 15) {
      throw new Error(
        // Redis allows [0..16) by default
        // we separate the db for different usages by `this.options.db + [0..4]`
        `Invalid database index: ${db}, must be between 0 and 11`
      );
    }
  }

  static buildRedisOptions(config: Config['redis']): RedisOptions {
    const { tls, ...baseConfig } = config;

    const options: RedisOptions = {
      ...baseConfig,
      ...baseConfig.ioredis,
    };

    // Handle TLS configuration - for cloud services like Upstash
    if (tls) {
      options.tls = {};
    }

    return options;
  }
}

@Injectable()
export class CacheRedis extends Redis {
  constructor(config: Config) {
    super(Redis.buildRedisOptions(config.redis));
  }
}

@Injectable()
export class SessionRedis extends Redis {
  constructor(config: Config) {
    const options = Redis.buildRedisOptions(config.redis);
    super({
      ...options,
      db: 0, // Use database 0 for Upstash compatibility
      keyPrefix: 'session:', // Add prefix for logical separation
    });
  }
}

@Injectable()
export class SocketIoRedis extends Redis {
  constructor(config: Config) {
    const options = Redis.buildRedisOptions(config.redis);
    super({
      ...options,
      db: 0, // Use database 0 for Upstash compatibility
      keyPrefix: 'socket:', // Add prefix for logical separation
    });
  }
}

@Injectable()
export class QueueRedis extends Redis {
  constructor(config: Config) {
    const options = Redis.buildRedisOptions(config.redis);
    super({
      ...options,
      db: 0, // Use database 0 for Upstash compatibility
      keyPrefix: 'queue:', // Add prefix for logical separation
      // required explicitly set to `null` by bullmq
      maxRetriesPerRequest: null,
    });
  }
}
