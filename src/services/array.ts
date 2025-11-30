export const ArrayService = {
  randomElement<T>(a: T[]) {
    const i = Math.floor(Math.random() * a.length);
    return a[i];
  },
};
