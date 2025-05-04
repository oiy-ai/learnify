# Introduction

Operation Pattern is a tiny `RPC` framework available both in frontend and backend.

It introduces super simple call and listen signatures to make Worker, cross tabs SharedWorker or BroadcastChannel easier to use and reduce boilerplate.

# usage

## Register Op Handlers

### Function call handler

```ts
interface Ops extends OpSchema {
  add: [{ a: number; b: number }, number]
}

// register
const consumer: OpConsumer<Ops>;
consumer.register('add', ({ a, b }) => a + b);

// call
const client: OpClient<Ops>;
const ret = client.call('add', { a: 1, b: 2 })); // Promise<3>
```

### Stream call handler

```ts
interface Ops extends OpSchema {
  subscribeStatus: [number, string];
}

// register
const consumer: OpConsumer<Ops>;
consumer.register('subscribeStatus', (id: number) => {
  return interval(3000).pipe(map(() => 'connected'));
});

// subscribe
const client: OpClient<Ops>;
client.ob$('subscribeStatus', 123).subscribe({
  next: status => {
    ui.setServerStatus(status);
  },
  error: error => {
    ui.setServerError(error);
  },
  complete: () => {
    //
  },
});
```

### Transfer variables

> [Transferable Objects](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects)

#### Client transferables

```ts
interface Ops extends OpSchema {
  heavyWork: [{ name: string; data: Uint8Array; data2: Uint8Array }, void];
}

const client: OpClient<Ops>;
const data = new Uint8Array([1, 2, 3]);
const nonTransferredData = new Uint8Array([1, 2, 3]);
client.call(
  'heavyWork',
  transfer(
    {
      name: '',
      data: data,
      data2: nonTransferredData,
    },
    [data.buffer]
  )
);

// after transferring, you can not use the transferred variables anymore!!!
// moved
assertEq(data.byteLength, 0);
// copied
assertEq(nonTransferredData.byteLength, 3);
```

#### Consumer transferables

```ts
interface Ops extends OpSchema {
  job: [{ id: string }, Uint8Array];
}

const consumer: OpConsumer<Ops>;
consumer.register('ops', ({ id }) => {
  return interval(3000).pipe(
    map(() => {
      const data = new Uint8Array([1, 2, 3]);
      transfer(data, [data.buffer]);
    })
  );
});
```

## Communication

### BroadcastChannel

:::CAUTION

BroadcastChannel doesn't support transfer transferable objects. All data passed through it's `postMessage` api would be structured cloned

see [Structured_clone_algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm)

:::

```ts
const channel = new BroadcastChannel('domain');
const consumer = new OpConsumer(channel);
consumer.listen();

const client = new OpClient(channel);
client.listen();
```

### MessageChannel

```ts
const { port1, port2 } = new MessageChannel();

const client = new OpClient(port1);
const consumer = new OpConsumer(port2);
```

### Worker

```ts
const worker = new Worker('./xxx-worker');
const client = new OpClient(worker);

// in worker
const consumer = new OpConsumer(globalThis);
consumer.listen();
```

### SharedWorker

```ts
const worker = new SharedWorker('./xxx-worker');
const client = new OpClient(worker.port);

// in worker
globalThis.addEventListener('connect', event => {
  const port = event.ports[0];
  const consumer = new OpConsumer(port);
  consumer.listen();
});
```
