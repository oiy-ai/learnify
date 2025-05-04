import { Store } from '@toeverything/infra';
import { map } from 'rxjs';

import type { GlobalStateService } from '../../storage';
import { BUILD_IN_SERVERS } from '../constant';
import type { ServerConfig, ServerMetadata } from '../types';

export class ServerListStore extends Store {
  constructor(private readonly globalStateService: GlobalStateService) {
    super();
  }

  watchServerList() {
    return this.globalStateService.globalState
      .watch<ServerMetadata[]>('serverList')
      .pipe(
        map(servers => {
          const serverList = [...BUILD_IN_SERVERS, ...(servers ?? [])];
          return serverList;
        })
      );
  }

  getServerList() {
    return [
      ...BUILD_IN_SERVERS,
      ...(this.globalStateService.globalState.get<ServerMetadata[]>(
        'serverList'
      ) ?? []),
    ];
  }

  addServer(server: ServerMetadata, serverConfig: ServerConfig) {
    const oldServers =
      this.globalStateService.globalState.get<ServerMetadata[]>('serverList') ??
      [];

    if (oldServers.some(s => s.baseUrl === server.baseUrl)) {
      throw new Error(
        'Server with same base url already exists, ' + server.baseUrl
      );
    }

    this.updateServerConfig(server.id, serverConfig);
    this.globalStateService.globalState.set<ServerMetadata[]>('serverList', [
      ...oldServers,
      server,
    ]);
  }

  removeServer(serverId: string) {
    const oldServers =
      this.globalStateService.globalState.get<ServerMetadata[]>('serverList') ??
      [];

    this.globalStateService.globalState.set<ServerMetadata[]>(
      'serverList',
      oldServers.filter(server => server.id !== serverId)
    );
  }

  watchServerConfig(serverId: string) {
    return this.globalStateService.globalState
      .watch<ServerConfig>(`serverConfig:${serverId}`)
      .pipe(
        map(config => {
          if (!config) {
            return BUILD_IN_SERVERS.find(server => server.id === serverId)
              ?.config;
          } else {
            return config;
          }
        })
      );
  }

  getServerConfig(serverId: string) {
    return (
      this.globalStateService.globalState.get<ServerConfig>(
        `serverConfig:${serverId}`
      ) ?? BUILD_IN_SERVERS.find(server => server.id === serverId)?.config
    );
  }

  updateServerConfig(serverId: string, config: ServerConfig) {
    this.globalStateService.globalState.set<ServerConfig>(
      `serverConfig:${serverId}`,
      config
    );
  }
}
