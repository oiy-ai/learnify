import './config';

import { Module } from '@nestjs/common';

import { WEBSOCKET_OPTIONS, websocketOptionsProvider } from './options';

@Module({
  providers: [websocketOptionsProvider],
  exports: [websocketOptionsProvider],
})
export class WebSocketModule {}

export { WEBSOCKET_OPTIONS };
export { SocketIoAdapter } from './adapter';
