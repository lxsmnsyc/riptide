import { riptide, useState, useEffect } from '../src';

describe('example', () => {
  const count = riptide(() => {
    const [state, setState] = useState(0);

    useEffect(() => {
      if (state > 10) {
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

  count.subscribe({
    next(value) {
      console.log(`Next: ${value}`);
    },
    error(value) {
      console.error(value);
    },
  });
});
