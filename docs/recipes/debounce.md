```ts
export default function useRiptideDebounce<T>(
  riptide: RiptideObservable<T>,
  cooldown: number,
): RiptideResult<T> {
  const [state, setState] = useState<RiptideResult<T>>(undefined);

  useEffect(() => {
    let current: ReturnType<typeof setTimeout> | undefined;

    const subscription = riptide.subscribe({
      next(value) {
        if (current) {
          clearTimeout(current);
        }
        current = setTimeout(() => {
          setState(next(value));
          current = undefined;
        }, cooldown);
      },
      complete() {
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
