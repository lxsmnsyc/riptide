# riptide

> An experimental state management library. Write Observables like you write React hooks.

## Install

yarn

```bash
yarn add @lxsmnsyc/riptide
```

npm

```bash
npm install @lxsmnsyc/riptide
```

## Example

```ts
import riptide from '@lxsmnsyc/riptide';

const counter = riptide.createColdRiptide(() => {
  const [state, setState] = riptide.useState(0);

  if (state > 10) {
    return riptide.complete();
  }

  setState(state + 1);

  return riptide.next(state);
});

counter.subscribe({
  next(value) {
    console.log(`Received: ${value}`);
  },
  error(value) {
    console.log(value);
  },
  complete() {
    console.log(`Counter completed!`);
  },
});
```

## License

MIT © [lxsmnsyc](https://github.com/lxsmnsyc)