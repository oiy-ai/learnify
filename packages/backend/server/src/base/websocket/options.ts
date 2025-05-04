import { FactoryProvider } from '@nestjs/common';

import { Config } from '../config';

export const WEBSOCKET_OPTIONS = Symbol('WEBSOCKET_OPTIONS');

export const websocketOptionsProvider: FactoryProvider = {
  provide: WEBSOCKET_OPTIONS,
  useFactory: (config: Config) => {
    return config.websocket;
  },
  inject: [Config],
};
