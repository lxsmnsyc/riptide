```ts
export default function useRiptideFilter<T>(
  riptide: RiptideObservable<T>,
  filter: (value: T) => boolean,
): T | undefined {
  const [state, setState] = useState<MutableRefObject<T | undefined>>({
    current: undefined,
  });

  useEffect(() => {
    const subscription = riptide.subscribe({
      next(value) {
        setState((current) => (filter(value) ? { current: value } : current));
      },
    });

    return () => {
      subscription.cancel();
    };
  }, [riptide, filter]);

  return state.current;
}
```