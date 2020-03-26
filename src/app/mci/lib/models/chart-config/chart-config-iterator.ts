/**
 * Concrete Iterators implement various traversal algorithms. These classes
 * store the current traversal position at all times.
 */

import { ChartConfig } from './chart-config';
import { ChartConfigCollection } from './chart-config-collection';
import { MyIterator } from '../common/my-iterator';

export class ChartConfigIterator implements MyIterator<ChartConfig> {
  private collection: ChartConfigCollection;

  /**
   * Stores the current traversal position. An iterator may have a lot of
   * other fields for storing iteration state, especially when it is supposed
   * to work with a particular kind of collection.
   */
  private position = 0;

  /**
   * This variable indicates the traversal direction.
   */
  private reverse = false;

  constructor(collection: ChartConfigCollection, reverse: boolean = false) {
      this.collection = collection;
      this.reverse = reverse;

      if (reverse) {
          this.position = collection.getCount() - 1;
      }
  }

  public rewind() {
      this.position = this.reverse ?
          this.collection.getCount() - 1 :
          0;
  }

  public current(): ChartConfig {
      return this.collection.getItems()[this.position];
  }

  public key(): number {
      return this.position;
  }

  public next(): ChartConfig {
      const item = this.collection.getItems()[this.position];
      this.position += this.reverse ? -1 : 1;
      return item;
  }

  public valid(): boolean {
      if (this.reverse) {
          return this.position >= 0;
      }

      return this.position < this.collection.getCount();
  }
}
