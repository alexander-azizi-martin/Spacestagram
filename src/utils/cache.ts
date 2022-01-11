type Entry<KeyT, DataT> = {
  key: KeyT | null;
  data: DataT | null;
  next: Entry<KeyT, DataT> | null;
};

class Cache<KeyT, DataT> {
  max_size: number;
  entries: Map<KeyT, DataT>;

  head: Entry<KeyT, DataT> | null;
  tail: Entry<KeyT, DataT> | null;

  constructor(max_size: number) {
    this.max_size = max_size;
    this.entries = new Map();

    this.head = null;
    this.tail = null;
  }

  get(key: KeyT) {
    return this.entries.get(key);
  }

  has(key: KeyT) {
    return this.entries.has(key);
  }

  set(key: KeyT, data: DataT) {
    let entry = { key, data, next: null };

    if (this.head == null) {
      this.head = entry;
    }
    if (this.tail != null) {
      this.tail.next = entry;
    }

    // Deletes the oldest element in the cash if it reaches it limit
    if (this.max_size <= this.entries.size && this.head) {
      this.delete(this.head.key as KeyT);
      this.head = this.head.next;
    }

    this.tail = entry;
    this.entries.set(key, data);
  }

  delete(key: KeyT) {
    return this.entries.delete(key);
  }

  clear() {
    return this.entries.clear();
  }
}

export default Cache;
