/* @layer shared-game @kind logic */
import { itemAt } from '../../checked-access';

class PriorityQueue<T> {
  private heap: T[] = [];
  private compare: (a: T, b: T) => number;

  constructor(compareFn: (a: T, b: T) => number) {
    this.compare = compareFn;
  }

  get size(): number { return this.heap.length; }
  get isEmpty(): boolean { return this.heap.length === 0; }

  push(item: T): void {
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): T | undefined {
    const top = this.heap[0];
    const last = this.heap.pop();
    if (last === undefined) return undefined;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.sinkDown(0);
    }
    return top;
  }

  peek(): T | undefined { return this.heap[0]; }

  private swap(a: number, b: number): void {
    const first = itemAt(this.heap, a);
    this.heap[a] = itemAt(this.heap, b);
    this.heap[b] = first;
  }

  private order(a: number, b: number): number {
    return this.compare(itemAt(this.heap, a), itemAt(this.heap, b));
  }

  private less(a: number, b: number): boolean {
    return this.order(a, b) < 0;
  }

  private bubbleUp(start: number): void {
    let idx = start;
    while (idx > 0) {
      const parent = (idx - 1) >> 1;
      if (this.order(idx, parent) >= 0) break;
      this.swap(idx, parent);
      idx = parent;
    }
  }

  private sinkDown(start: number): void {
    const len = this.heap.length;
    let idx = start;
    while (true) {
      let smallest = idx;
      const left = 2 * idx + 1;
      const right = 2 * idx + 2;
      if (left < len && this.less(left, smallest)) smallest = left;
      if (right < len && this.less(right, smallest)) smallest = right;
      if (smallest === idx) break;
      this.swap(idx, smallest);
      idx = smallest;
    }
  }
}

export { PriorityQueue };
