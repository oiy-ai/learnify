import { Injectable } from '@nestjs/common';

import { CacheRedis, SessionRedis } from '../redis';
import { CacheProvider } from './provider';

@Injectable()
export class Cache extends CacheProvider {
  constructor(redis: CacheRedis) {
    super(redis);
  }
}

@Injectable()
export class SessionCache extends CacheProvider {
  constructor(redis: SessionRedis) {
    super(redis);
  }
}
