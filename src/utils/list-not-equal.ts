export default function listNotEqual<A extends any[], B extends any[]>(a: A, b: B): boolean {
  if (a.length !== b.length) {
    return true;
  }
  for (let i = 0; i < a.length; i += 1) {
    if (!Object.is(a[i], b[i])) {
      return true;
    }
  }
  return false;
}
