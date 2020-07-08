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

  return {
    value: state,
  };
});

const receiver = riptide(() => {
  const state = useRiptide(() => count, 0, []);

  if (state && state % 2 === 0) {
    return {
      value: `Next: ${state}`,
    };
  }
  return undefined;
});

receiver.subscribe({
  next(value) {
    console.log(value);
  },
  error(value) {
    console.error(value);
  },
});