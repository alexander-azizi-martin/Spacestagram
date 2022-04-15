type Entry<KeyT, DataT> = {
  key: KeyT;
  data: DataT;
  prev: Entry<KeyT, DataT> | null;
  next: Entry<KeyT, DataT> | null;
};

class Cache<KeyT, DataT> {
  max_size: number;
  entries: Map<KeyT, Entry<KeyT, DataT>>;

  head: Entry<KeyT, DataT> | null;
  tail: Entry<KeyT, DataT> | null;

  constructor(max_size: number) {
    if (max_size <= 0) {
      throw new Error('Size must be greater than 0.');
    }

    this.max_size = max_size;
    this.entries = new Map();

    this.head = null;
    this.tail = null;
  }

  get(key: KeyT) {
    return this.entries.get(key)?.data;
  }

  has(key: KeyT) {
    return this.entries.has(key);
  }

  set(key: KeyT, data: DataT) {
    const entry = { key, data, prev: this.tail, next: null };

    if (this.head == null) {
      this.head = entry;
      this.tail = entry;
    } else {
      // @ts-ignore If the head is not null neither is the tail
      this.tail.next = entry;
      this.tail = entry;
    }

    // Deletes the oldest element in the cash if it reaches it limit
    if (this.max_size <= this.entries.size && this.head) {
      const newHead = this.head.next;
      this.delete(this.head.key as KeyT);
      this.head = newHead;
    }

    this.entries.set(key, entry);
  }

  delete(key: KeyT) {
    const entry = this.entries.get(key);
    if (entry && entry.prev) {
      entry.prev.next = entry.next;
    }
    if (entry && entry.next) {
      entry.next.prev = entry.prev;
    }

    return this.entries.delete(key);
  }

  clear() {
    this.head = null;
    this.tail = null;

    return this.entries.clear();
  }
}

export default Cache;
