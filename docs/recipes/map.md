
```ts
export default function useRiptideMap<T, R>(
  riptide: RiptideObservable<T>,
  mapper: (value: T) => R,
): RiptideResult<R> {
  const [state, setState] = useState<RiptideResult<R>>(undefined);

  useEffect(() => {
    const subscription = riptide.subscribe({
      next(value) {
        setState(next(mapper(value)));
      },
      complete() {
        setState(complete());
      },
    });

    return () => {
      subscription.cancel();
    };
  }, [riptide, mapper]);

  return state;
}
```