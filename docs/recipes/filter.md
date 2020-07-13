```ts
export default function useRiptideFilter<T>(
  riptide: RiptidePublisher<T>,
  filter: (value: T) => boolean,
): RiptideResult<T> {
  const [state, setState] = useState<RiptideResult<T>>(undefined);

  useEffect(() => {
    const subscription = riptide.subscribe({
      next(value) {
        if (filter(value)) {
          setState(next(value));
        }
      },
      complete() {
        setState(complete());
      },
    });

    return () => {
      subscription.cancel();
    };
  }, [riptide, filter]);

  return state;
}
```