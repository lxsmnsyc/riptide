```ts
export default function useRiptideDelay<T>(
  riptide: RiptidePublisher<T>,
  cooldown: number,
): RiptideResult<T> {
  const [state, setState] = useState<RiptideResult<T>>(undefined);

  useEffect(() => {
    const current: ReturnType<typeof setTimeout>[] = [];

    const subscription = riptide.subscribe({
      next(value) {
        current.push(setTimeout(() => {
          setState(next(value));
        }, cooldown));
      },
      complete() {
        current.push(setTimeout(() => {
          setState(complete());
        }, cooldown));
      },
    });

    return () => {
      current.forEach((timeout) => {
        clearTimeout(timeout);
      });
      subscription.cancel();
    };
  }, [riptide, cooldown]);

  return state;
}
```