export function getClosestItemIndexes(array, value, accessor, log = null) {
  let lo = 0;
  let hi = array.length - 1;

  while (hi - lo > 1) {
    const mid = Math.round((lo + hi) / 2);
    if (accessor(array[mid]) <= value) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  // for Date object === does not work, so using the <= in combination with >=
  // the same code works for both dates and numbers
  if (accessor(array[lo]).valueOf() === value.valueOf()) {
    hi = lo;
  }
  if (accessor(array[hi]).valueOf() === value.valueOf()) { lo = hi; }

  if (accessor(array[lo]) < value && accessor(array[hi]) < value) {
    lo = hi;
  }
  if (accessor(array[lo]) > value && accessor(array[hi]) > value) {
    hi = lo;
  }

  if (log) {
    // console.log(lo, accessor(array[lo]), value, accessor(array[hi]), hi);
    // console.log(accessor(array[lo]), lo, value, accessor(array[lo]) >= value);
    // console.log(value, hi, accessor(array[hi]), accessor(array[lo]) <= value);
  }
  // var left = value > accessor(array[lo]) ? lo : lo;
  // var right = gte(value, accessor(array[hi])) ? Math.min(hi + 1, array.length - 1) : hi;

  // console.log(value, accessor(array[left]), accessor(array[right]));
  return { left: lo, right: hi };
}

export function isDefined(d) {
  return d !== null && typeof d !== 'undefined';
}

export function isNotDefined(d) {
  return !isDefined(d);
}

export function head(array, accessor = null) {
  if (accessor && array) {
    for (const a of array) {
      if (isDefined(accessor(a))) {
        return a;
      }
    }
    return undefined;
  }
  return array ? array[0] : undefined;
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

export function functor(v) {
  return typeof v === 'function' ? v : () => v;
}
