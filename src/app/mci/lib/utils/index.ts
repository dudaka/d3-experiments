export function mousePosition(e, defaultRect = null) {
  console.log('[foutside] mousePosition');
  console.log(e);
  const container = e.currentTarget;
  const rect = defaultRect || container.getBoundingClientRect();
  const x = e.clientX - rect.left - container.clientLeft;
  const y = e.clientY - rect.top - container.clientTop;
  const xy = [Math.round(x), Math.round(y)];
  console.log(xy);
  return xy;
}

export function touchPosition(touch, e) {
  const container = e.target;
  const rect = container.getBoundingClientRect();
  const x = touch.clientX - rect.left - container.clientLeft;
  const y = touch.clientY - rect.top - container.clientTop;
  const xy = [Math.round(x), Math.round(y)];
  return xy;
}

export function getTouchProps(touch) {
  if (!touch) { return {}; }
  return {
    pageX: touch.pageX,
    pageY: touch.pageY,
    clientX: touch.clientX,
    clientY: touch.clientY
  };
}

export function d3Window(node) {
  // console.log('[d3Window]');
  // console.log(node);
  // console.log(node.ownerDocument);
  // console.log(node.ownerDocument.defaultView);
  // console.log(node.document);
  // console.log(node.defaultView);
  const d3win = node
    && (node.ownerDocument && node.ownerDocument.defaultView
      || node.document && node
      || node.defaultView);
  // console.log(d3win);
  return d3win;
}

export const MOUSEENTER = 'mouseenter.interaction';
export const MOUSELEAVE = 'mouseleave.interaction';
export const MOUSEMOVE = 'mousemove.pan';
export const MOUSEUP = 'mouseup.pan';
export const TOUCHMOVE = 'touchmove.pan';
export const TOUCHEND = 'touchend.pan touchcancel.pan';

export function getClosestItem(array, value, accessor, log = false) {
  const { left, right } = getClosestItemIndexes(array, value, accessor, log);

  if (left === right) {
    return array[left];
  }

  const closest = (Math.abs(accessor(array[left]) - value) < Math.abs(accessor(array[right]) - value))
    ? array[left]
    : array[right];
  if (log) {
    console.log(array[left], array[right], closest, left, right);
  }
  return closest;
}

// copied from https://github.com/lodash/lodash/blob/master/mapObject.js
export function mapObject(object = {}, iteratee = d => d) {
  const props = Object.keys(object);

  // eslint-disable-next-line prefer-const
  const result = new Array(props.length);

  props.forEach((key, index) => {
    // result[index] = iteratee(object[key], key, object);
    result[index] = iteratee(object[key]);
  });
  return result;
}

export function isObject(d) {
  return isDefined(d) && typeof d === 'object' && !Array.isArray(d);
}

export function find(list, predicate, context = this) {
  for (let i = 0; i < list.length; ++i) {
    if (predicate.call(context, list[i], i, list)) {
      return list[i];
    }
  }
  return undefined;
}

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
