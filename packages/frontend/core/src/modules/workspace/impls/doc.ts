import { getStoreManager } from '@affine/core/blocksuite/manager/migrating-store';
import {
  AwarenessStore,
  type Doc,
  type ExtensionType,
  type GetBlocksOptions,
  type Query,
  Store,
  type Workspace,
  type YBlock,
} from '@blocksuite/affine/store';
import { signal } from '@preact/signals-core';
import { Subject } from 'rxjs';
import { Awareness } from 'y-protocols/awareness.js';
import * as Y from 'yjs';

type DocOptions = {
  id: string;
  collection: Workspace;
  doc: Y.Doc;
};

export class DocImpl implements Doc {
  private readonly _canRedo = signal(false);

  private readonly _canUndo = signal(false);

  private readonly _collection: Workspace;

  private readonly _storeMap = new Map<string, Store>();

  // doc/space container.
  private readonly _handleYEvents = (events: Y.YEvent<YBlock | Y.Text>[]) => {
    events.forEach(event => this._handleYEvent(event));
  };

  private _history!: Y.UndoManager;

  private readonly _historyObserver = () => {
    this._updateCanUndoRedoSignals();
    this.slots.historyUpdated.next();
  };

  private readonly _initSubDoc = () => {
    {
      // This is a piece of old version compatible code. The old version relies on the subdoc instance on `spaces`.
      // So if there is no subdoc on spaces, we will create it.
      // new version no longer needs subdoc on `spaces`.
      let subDoc = this.rootDoc.getMap('spaces').get(this.id);
      if (!subDoc) {
        subDoc = new Y.Doc({
          guid: this.id,
        });
        this.rootDoc.getMap('spaces').set(this.id, subDoc);
      }
    }

    const spaceDoc = new Y.Doc({
      guid: this.id,
    });
    spaceDoc.clientID = this.rootDoc.clientID;
    this._loaded = false;

    return spaceDoc;
  };

  private _loaded!: boolean;

  // eslint-disable-next-line rxjs/finnish
  private readonly _onLoadSlot = new Subject();

  /** Indicate whether the block tree is ready */
  private _ready = false;

  private _shouldTransact = true;

  private readonly _updateCanUndoRedoSignals = () => {
    const canRedo = this._history.canRedo();
    const canUndo = this._history.canUndo();
    if (this._canRedo.peek() !== canRedo) {
      this._canRedo.value = canRedo;
    }
    if (this._canUndo.peek() !== canUndo) {
      this._canUndo.value = canUndo;
    }
  };

  protected readonly _yBlocks: Y.Map<YBlock>;

  /**
   * @internal Used for convenient access to the underlying Yjs map,
   * can be used interchangeably with ySpace
   */
  protected readonly _ySpaceDoc: Y.Doc;

  readonly storeExtensions: ExtensionType[] = [];

  readonly awarenessStore: AwarenessStore;

  readonly id: string;

  readonly rootDoc: Y.Doc;

  readonly slots = {
    // eslint-disable-next-line rxjs/finnish
    historyUpdated: new Subject<void>(),
    // eslint-disable-next-line rxjs/finnish
    yBlockUpdated: new Subject<
      | {
          type: 'add';
          id: string;
          isLocal: boolean;
        }
      | {
          type: 'delete';
          id: string;
          isLocal: boolean;
        }
    >(),
  };

  get blobSync() {
    return this.workspace.blobSync;
  }

  get canRedo() {
    return this._canRedo.peek();
  }

  get canUndo() {
    return this._canUndo.peek();
  }

  get workspace() {
    return this._collection;
  }

  get history() {
    return this._history;
  }

  get isEmpty() {
    return this._yBlocks.size === 0;
  }

  get loaded() {
    return this._loaded;
  }

  get meta() {
    return this.workspace.meta.getDocMeta(this.id);
  }

  get ready() {
    return this._ready;
  }

  get spaceDoc() {
    return this._ySpaceDoc;
  }

  get yBlocks() {
    return this._yBlocks;
  }

  constructor({ id, collection, doc }: DocOptions) {
    this.id = id;
    this.rootDoc = doc;
    this._ySpaceDoc = this._initSubDoc() as Y.Doc;
    this.awarenessStore = new AwarenessStore(new Awareness(this._ySpaceDoc));

    this._yBlocks = this._ySpaceDoc.getMap('blocks');
    this._collection = collection;
  }

  private _getReadonlyKey(readonly?: boolean): 'true' | 'false' {
    return (readonly?.toString() as 'true' | 'false') ?? 'false';
  }

  private _handleYBlockAdd(id: string, isLocal: boolean) {
    this.slots.yBlockUpdated.next({ type: 'add', id, isLocal });
  }

  private _handleYBlockDelete(id: string, isLocal: boolean) {
    this.slots.yBlockUpdated.next({ type: 'delete', id, isLocal });
  }

  private _handleYEvent(event: Y.YEvent<YBlock | Y.Text | Y.Array<unknown>>) {
    // event on top-level block store
    if (event.target !== this._yBlocks) {
      return;
    }
    const isLocal =
      !event.transaction.origin ||
      !this._yBlocks.doc ||
      event.transaction.origin instanceof Y.UndoManager ||
      event.transaction.origin.proxy
        ? true
        : event.transaction.origin === this._yBlocks.doc.clientID;
    event.keys.forEach((value, id) => {
      try {
        if (value.action === 'add') {
          this._handleYBlockAdd(id, isLocal);
          return;
        }
        if (value.action === 'delete') {
          this._handleYBlockDelete(id, isLocal);
          return;
        }
      } catch (e) {
        console.error('An error occurred while handling Yjs event:');
        console.error(e);
      }
    });
  }

  private _initYBlocks() {
    const { _yBlocks } = this;
    _yBlocks.observeDeep(this._handleYEvents);
    this._history = new Y.UndoManager([_yBlocks], {
      trackedOrigins: new Set([this._ySpaceDoc.clientID]),
    });

    this._history.on('stack-cleared', this._historyObserver);
    this._history.on('stack-item-added', this._historyObserver);
    this._history.on('stack-item-popped', this._historyObserver);
    this._history.on('stack-item-updated', this._historyObserver);
  }

  /** Capture current operations to undo stack synchronously. */
  captureSync() {
    this._history.stopCapturing();
  }

  clear() {
    this._yBlocks.clear();
  }

  clearQuery(query: Query, readonly?: boolean) {
    const key = this._getQueryKey({ readonly, query });
    this._storeMap.delete(key);
  }

  private _destroy() {
    this.awarenessStore.destroy();
    this._ySpaceDoc.destroy();
    this._onLoadSlot.unsubscribe();
    this._loaded = false;
  }

  dispose() {
    this._destroy();
    this.slots.historyUpdated.unsubscribe();

    if (this.ready) {
      this._yBlocks.unobserveDeep(this._handleYEvents);
      this._yBlocks.clear();
    }
  }

  private readonly _getQueryKey = (
    idOrOptions: string | { readonly?: boolean; query?: Query }
  ) => {
    if (typeof idOrOptions === 'string') {
      return idOrOptions;
    }
    const { readonly, query } = idOrOptions;
    const readonlyKey = this._getReadonlyKey(readonly);
    const key = JSON.stringify({
      readonlyKey,
      query,
    });
    return key;
  };

  getStore({
    readonly,
    query,
    provider,
    extensions,
    id,
  }: GetBlocksOptions = {}) {
    let idOrOptions: string | { readonly?: boolean; query?: Query };
    if (readonly || query) {
      idOrOptions = { readonly, query };
    } else if (!id) {
      idOrOptions = this.workspace.idGenerator();
    } else {
      idOrOptions = id;
    }
    const key = this._getQueryKey(idOrOptions);

    if (this._storeMap.has(key)) {
      return this._storeMap.get(key) as Store;
    }

    const storeExtensions = getStoreManager().get('store');
    const extensionSet = new Set(
      storeExtensions.concat(extensions ?? []).concat(this.storeExtensions)
    );

    const doc = new Store({
      doc: this,
      readonly,
      query,
      provider,
      extensions: Array.from(extensionSet),
    });

    this._storeMap.set(key, doc);

    return doc;
  }

  load(initFn?: () => void): this {
    if (this.ready) {
      return this;
    }

    this.spaceDoc.load();
    this.workspace.onLoadDoc?.(this.spaceDoc);
    this.workspace.onLoadAwareness?.(this.awarenessStore.awareness);

    this._initYBlocks();

    this._yBlocks.forEach((_, id) => {
      this._handleYBlockAdd(id, false);
    });

    initFn?.();

    this._loaded = true;
    this._ready = true;

    return this;
  }

  redo() {
    this._history.redo();
  }

  undo() {
    this._history.undo();
  }

  remove() {
    this._destroy();
    this.rootDoc.getMap('spaces').delete(this.id);
  }

  resetHistory() {
    this._history.clear();
  }

  /**
   * If `shouldTransact` is `false`, the transaction will not be push to the history stack.
   */
  transact(fn: () => void, shouldTransact: boolean = this._shouldTransact) {
    this._ySpaceDoc.transact(
      () => {
        try {
          fn();
        } catch (e) {
          console.error(
            `An error occurred while Y.doc ${this._ySpaceDoc.guid} transacting:`
          );
          console.error(e);
        }
      },
      shouldTransact ? this.rootDoc.clientID : null
    );
  }

  withoutTransact(callback: () => void) {
    this._shouldTransact = false;
    callback();
    this._shouldTransact = true;
  }
}
