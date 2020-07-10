
```ts
export default function useRiptideMap<T, R>(
  riptide: RiptideObservable<T>,
  mapper: (value: T) => R,
): R | undefined {
  const [state, setState] = useState<MutableRefObject<R | undefined>>({
    current: undefined,
  });

  useEffect(() => {
    const subscription = riptide.subscribe({
      next(value) {
        setState(() => ({ current: mapper(value) }));
      },
    });

    return () => {
      subscription.cancel();
    };
  }, [riptide, mapper]);

  return state.current;
}
```