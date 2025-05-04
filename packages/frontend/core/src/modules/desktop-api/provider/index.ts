import type {
  AppInfo,
  ClientEvents,
  ClientHandler,
  SharedStorage,
} from '@affine/electron-api';
import { createIdentifier } from '@toeverything/infra';

// for now desktop api's type are all inferred from electron-api
export interface DesktopApiProvider {
  handler?: ClientHandler;
  events?: ClientEvents;
  sharedStorage?: SharedStorage;
  appInfo: AppInfo;
}

export const DesktopApiProvider =
  createIdentifier<DesktopApiProvider>('DesktopApiProvider');
