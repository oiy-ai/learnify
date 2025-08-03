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

  protected keyPrefix: string = '';

  // Override get/set methods to add prefix
  override async get(key: string): Promise<string | null> {
    return super.get(this.keyPrefix + key);
  }

  override async set(
    key: string,
    value: string | Buffer | number,
    ...args: any[]
  ): Promise<any> {
    return super.set(this.keyPrefix + key, value, ...args);
  }

  // @ts-expect-error Override method signature differs from parent class
  override async del(...keys: (string | Buffer)[]): Promise<number> {
    return super.del(...keys.map(key => this.keyPrefix + String(key)));
  }

  // @ts-expect-error Override method signature differs from parent class
  override async exists(...keys: (string | Buffer)[]): Promise<number> {
    return super.exists(...keys.map(key => this.keyPrefix + String(key)));
  }

  override async expire(key: string, seconds: number): Promise<number> {
    return super.expire(this.keyPrefix + key, seconds);
  }

  override async ttl(key: string): Promise<number> {
    return super.ttl(this.keyPrefix + key);
  }

  override async keys(pattern: string): Promise<string[]> {
    const keys = await super.keys(this.keyPrefix + pattern);
    return keys.map(key => key.slice(this.keyPrefix.length));
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
}

@Injectable()
export class CacheRedis extends Redis {
  constructor(config: Config) {
    const { tls, ...redisConfig } = config.redis;
    const options: RedisOptions = {
      ...redisConfig,
      ...config.redis.ioredis,
      db: 0, // Upstash only supports database 0
    };

    // Add TLS configuration if enabled
    if (tls) {
      options.tls = {
        rejectUnauthorized: false,
      };
    }

    super(options);
    this.keyPrefix = 'cache:';
  }
}

@Injectable()
export class SessionRedis extends Redis {
  constructor(config: Config) {
    const { tls, ...redisConfig } = config.redis;
    const options: RedisOptions = {
      ...redisConfig,
      ...config.redis.ioredis,
      db: 0, // Upstash only supports database 0
    };

    // Add TLS configuration if enabled
    if (tls) {
      options.tls = {
        rejectUnauthorized: false,
      };
    }

    super(options);
    this.keyPrefix = 'session:';
  }
}

@Injectable()
export class SocketIoRedis extends Redis {
  constructor(config: Config) {
    const { tls, ...redisConfig } = config.redis;
    const options: RedisOptions = {
      ...redisConfig,
      ...config.redis.ioredis,
      db: 0, // Upstash only supports database 0
    };

    // Add TLS configuration if enabled
    if (tls) {
      options.tls = {
        rejectUnauthorized: false,
      };
    }

    super(options);
    this.keyPrefix = 'socketio:';
  }
}

@Injectable()
export class QueueRedis extends Redis {
  constructor(config: Config) {
    const { tls, ...redisConfig } = config.redis;
    const options: RedisOptions = {
      ...redisConfig,
      ...config.redis.ioredis,
      db: 0, // Upstash only supports database 0
      // required explicitly set to `null` by bullmq
      maxRetriesPerRequest: null,
    };

    // Add TLS configuration if enabled
    if (tls) {
      options.tls = {
        rejectUnauthorized: false,
      };
    }

    super(options);
    this.keyPrefix = 'queue:';
  }
}
