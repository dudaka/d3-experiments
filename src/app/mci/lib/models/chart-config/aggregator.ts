/**
 * Iterator Design Pattern
 *
 * Intent: Lets you traverse elements of a collection without exposing its
 * underlying representation (list, stack, tree, etc.).
 */

import { ChartConfig } from './chart-config';
import { MyIterator } from '../common/my-iterator';

export interface Aggregator {
  // Retrieve an external iterator.
  getIterator(): MyIterator<ChartConfig>;
}
