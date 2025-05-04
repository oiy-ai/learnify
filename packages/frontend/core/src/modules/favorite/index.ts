import { type Framework } from '@toeverything/infra';

import { WorkspaceDBService } from '../db';
import { WorkspaceScope, WorkspaceService } from '../workspace';
import { FavoriteList } from './entities/favorite-list';
import { FavoriteService } from './services/favorite';
import {
  CompatibleFavoriteItemsAdapter,
  MigrationFavoriteItemsAdapter,
} from './services/old/adapter';
import { FavoriteStore } from './stores/favorite';

export {
  FavoriteSupportType,
  type FavoriteSupportTypeUnion,
  isFavoriteSupportType,
} from './constant';
export type { FavoriteList } from './entities/favorite-list';
export { FavoriteService } from './services/favorite';
export {
  CompatibleFavoriteItemsAdapter,
  MigrationFavoriteItemsAdapter,
} from './services/old/adapter';

export function configureFavoriteModule(framework: Framework) {
  framework
    .scope(WorkspaceScope)
    .service(FavoriteService)
    .entity(FavoriteList, [FavoriteStore])
    .store(FavoriteStore, [WorkspaceDBService])
    .service(MigrationFavoriteItemsAdapter, [WorkspaceService])
    .service(CompatibleFavoriteItemsAdapter, [FavoriteService]);
}
