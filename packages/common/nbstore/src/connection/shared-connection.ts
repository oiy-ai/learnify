import type { AutoReconnectConnection } from './connection';

const CONNECTIONS: Map<string, AutoReconnectConnection<any>> = new Map();
export function share<T extends AutoReconnectConnection<any>>(conn: T): T {
  if (!conn.shareId) {
    throw new Error(
      `Connection ${conn.constructor.name} is not shareable.\nIf you want to make it shareable, please override [shareId].`
    );
  }

  const existing = CONNECTIONS.get(conn.shareId);

  if (existing) {
    return existing as T;
  }

  CONNECTIONS.set(conn.shareId, conn);

  return conn;
}
