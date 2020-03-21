export function isDefined(d) {
  return d !== null && typeof d !== 'undefined';
}

export function last(array: any[], accessor = null) {
  if (accessor && array) {
    let value;
    for (let i = array.length - 1; i >= 0; i--) {
      value = array[i];
      if (isDefined(accessor(value))) {
        return value;
      }
    }
    return undefined;
  }
  const length = array ? array.length : 0;
  return length ? array[length - 1] : undefined;
}
