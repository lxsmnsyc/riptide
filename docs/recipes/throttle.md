```ts
export default function useRiptideThrottle<T>(
  riptide: RiptideObservable<T>,
  cooldown: number,
): T | undefined {
  /**
   * Instead of directly writing the value to state,
   * we can wrap it inside an object so that
   * we can bypass useState's bail-out mechanism.
   */
  const [state, setState] = useState<MutableRefObject<T | undefined>>({
    current: undefined,
  });

  useEffect(() => {
    /**
     * Handles the timeout reference
     */
    let current: ReturnType<typeof setTimeout> | undefined;

    /**
     * Begin subscription
     */
    const subscription = riptide.subscribe({
      next(value) {
        /**
         * If there is no timeout reference,
         * emit the value
         */
        if (!current) {
          setState({
            current: value,
          });

          /**
           * Begin throttle
           */
          current = setTimeout(() => {
            current = undefined;
          }, cooldown);
        }
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
