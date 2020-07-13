```ts
export default function useRiptideThrottle<T>(
  riptide: RiptidePublisher<T>,
  cooldown: number,
): RiptideResult<T> {
  const [state, setState] = useState<RiptideResult<T>>(undefined);

  useEffect(() => {
    let current: ReturnType<typeof setTimeout> | undefined;
    const subscription = riptide.subscribe({
      next(value) {
        if (!current) {
          setState(next(value));
          current = setTimeout(() => {
            current = undefined;
          }, cooldown);
        }
      },
      complete() {
        if (current) {
          clearTimeout(current);
        }
        setState(complete());
      },
    });

    return () => {
      if (current) {
        clearTimeout(current);
      }
      subscription.cancel();
    };
  }, [riptide, cooldown]);

  return state;
}
```
