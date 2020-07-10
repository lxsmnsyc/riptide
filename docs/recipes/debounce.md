```ts
export default function useRiptideDebounce<T>(
  riptide: RiptideObservable<T>,
  cooldown: number,
): T | undefined {
  const [state, setState] = useState<MutableRefObject<T | undefined>>({
    current: undefined,
  });

  useEffect(() => {
    let current: ReturnType<typeof setTimeout> | undefined;

    const subscription = riptide.subscribe({
      next(value) {
        if (current) {
          clearTimeout(current);
        }
        current = setTimeout(() => {
          setState({
            current: value,
          });
          current = undefined;
        }, cooldown);
      },
    });

    return () => {
      if (current) {
        clearTimeout(current);
      }
      subscription.cancel();
    };
  }, [riptide, cooldown]);

  return state.current;
}
```
