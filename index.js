const { riptide, useState, useEffect, useRiptide } = require('./dist');

const count = riptide(() => {
  const [state, setState] = useState(1);

  useEffect(() => {
    if (state >= 10) {
      return undefined;
    }

    const timeout = setTimeout(() => {
      setState(state + 1);
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [state]);

  return state;
});

const receiver = riptide(() => {
  const state = useRiptide(() => count, 0, []);

  return `Next: ${state}`;
});

receiver.subscribe({
  next(value) {
    console.log(value);
  },
  error(value) {
    console.error(value);
  },
});