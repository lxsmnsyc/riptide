const riptide = require('./dist');

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
