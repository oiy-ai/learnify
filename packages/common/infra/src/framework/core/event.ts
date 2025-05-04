import { DebugLogger } from '@affine/debug';

import { stableHash } from '../../utils';
import type { FrameworkProvider } from '.';
import type { Service } from './components/service';
import { SUB_COMPONENTS } from './consts';
import { createIdentifier } from './identifier';
import type { SubComponent } from './types';

export interface FrameworkEvent<T> {
  id: string;
  _type: T;
}

export function createEvent<T>(id: string): FrameworkEvent<T> {
  return { id, _type: {} as T };
}

export type FrameworkEventType<T> =
  T extends FrameworkEvent<infer E> ? E : never;

const logger = new DebugLogger('affine:event-bus');

export class EventBus {
  private listeners: Record<string, Array<(payload: any) => void>> = {};

  constructor(
    provider: FrameworkProvider,
    private readonly parent?: EventBus
  ) {
    const handlers = provider.getAll(EventHandler, {
      sameScope: true,
    });

    for (const handler of handlers.values()) {
      this.on(handler.event, handler.handler);
    }
  }

  get root(): EventBus {
    return this.parent?.root ?? this;
  }

  on<T>(event: FrameworkEvent<T>, listener: (event: T) => void) {
    if (!this.listeners[event.id]) {
      this.listeners[event.id] = [];
    }
    this.listeners[event.id].push(listener);
    const off = this.parent?.on(event, listener);
    return () => {
      off?.();
      this.off(event.id, listener);
    };
  }

  private off(eventId: string, listener: (event: any) => void) {
    if (!this.listeners[eventId]) {
      return;
    }
    this.listeners[eventId] = this.listeners[eventId].filter(
      l => l !== listener
    );
  }

  emit<T>(event: FrameworkEvent<T>, payload: T) {
    logger.debug('Emitting event', event.id, payload);
    const listeners = this.listeners[event.id];
    if (!listeners) {
      return;
    }
    listeners.forEach(listener => {
      try {
        listener(payload);
      } catch (e) {
        console.error(e);
      }
    });
  }

  dispose(): void {
    for (const eventId of Object.keys(this.listeners)) {
      for (const listener of this.listeners[eventId]) {
        this.parent?.off(eventId, listener);
      }
    }
    this.listeners = {};
  }
}

interface EventHandler {
  event: FrameworkEvent<any>;
  handler: (payload: any) => void;
}

export const EventHandler = createIdentifier<EventHandler>('EventHandler');

export const OnEvent = <
  E extends FrameworkEvent<any>,
  C extends abstract new (...args: any) => any,
  I = InstanceType<C>,
>(
  e: E,
  pick: I extends Service ? (i: I) => (e: FrameworkEventType<E>) => void : never
) => {
  return (target: C): C => {
    const handlers = (target as any)[SUB_COMPONENTS] ?? [];
    (target as any)[SUB_COMPONENTS] = [
      ...handlers,
      {
        identifier: EventHandler(
          target.name + stableHash(e) + stableHash(pick)
        ),
        factory: provider => {
          return {
            event: e,
            handler: (payload: any) => {
              const i = provider.get(target);
              pick(i).apply(i, [payload]);
            },
          } satisfies EventHandler;
        },
      } satisfies SubComponent,
    ];
    return target;
  };
};
