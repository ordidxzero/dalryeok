import { atom, createStore, type PrimitiveAtom } from 'jotai/vanilla';
import { Entry, EntryConfig } from './utils/event';
import { DateTime, DateTimeRange } from './utils/date';

interface EntryNodeConfig {
  id: string;
  startDate: DateTime;
  endDate?: DateTime;
}

class EntryNode {
  readonly id: string;
  readonly startDate: DateTime;
  readonly endDate?: DateTime;
  private _next: string | null;

  constructor(config: EntryNodeConfig) {
    this.id = config.id;
    this.startDate = config.startDate;
    this.endDate = config.endDate;
    this._next = null;
  }

  setNext(id: string | null) {
    this._next = id;
  }

  get next() {
    return this._next;
  }
}

export class CalendarState {
  private _store: ReturnType<typeof createStore>;
  private _lookup: Map<string, PrimitiveAtom<Entry>>;
  private _node_lookup: Map<string, EntryNode>;
  private _root?: EntryNode;
  private _node?: EntryNode; // linked list를 구현하기 위해서 이전 노드를 저장해두는 변수
  constructor(entries: Array<EntryConfig> = []) {
    this._store = createStore();
    this._lookup = new Map();
    this._node_lookup = new Map();

    // entries는 startDate (desc), endDate(desc) 순으로 정렬되어있어야함.
    entries.forEach((config) => {
      const node = this._create(config);
      if (node) {
        this._linkNode(node);
        this._node = node;
      }
    });
    this._node = undefined;
  }

  private _createEntry(config: EntryConfig) {
    return new Entry(config);
  }

  private _createNode(config: EntryNodeConfig) {
    const node = new EntryNode(config);
    this._node_lookup.set(config.id, node);

    if (!this._root) {
      this._root = node;
    }

    return node;
  }

  private _linkNode(node: EntryNode) {
    if (this._node) {
      const next = this._node.next;
      this._node.setNext(node.id);

      node.setNext(next);
    }
  }

  private _create(config: EntryConfig) {
    const node = atom(this._createEntry(config));
    this._lookup.set(config.id, node);

    if (config.startDate) {
      return this._createNode({ id: config.id, startDate: config.startDate, endDate: config.endDate });
    }

    return null;
  }

  add(config: EntryConfig) {
    this._node = undefined;
    if (this._node_lookup.has(config.id)) throw Error('Duplicated IDs');

    const newNode = this._create(config);

    if (newNode === null) return;

    if (!this._root) {
      this._root = newNode;
      return;
    }

    let cursor: string | null = this._root.id;

    while (cursor !== null) {
      const node = this._node_lookup.get(cursor);

      if (node === undefined) throw Error('Not Implemented');

      if (newNode.startDate.isAfter(node.startDate)) {
        break;
      }
      this._node = node;
      cursor = node.next;
    }

    if (!this._node) {
      newNode.setNext(this._root.id);
      this._root = newNode;
    } else {
      this._linkNode(newNode);
    }
  }

  delete(id: string) {
    this._node = undefined;
    const target = this._node_lookup.get(id);

    if (target === undefined || this._root === undefined) return false;

    let cursor: string | null = this._root.id;

    while (cursor !== null) {
      const node = this._node_lookup.get(cursor);
      if (node === undefined) return false;

      if (id === node.next) {
        this._node = node;
        break;
      }

      cursor = node.next;
    }

    this._node_lookup.delete(id);
    this._lookup.delete(id);

    if (this._node) {
      this._node.setNext(target.next);
    }

    return true;
  }

  find(id: string): Entry | null;
  find(range: DateTimeRange): Array<Entry>;
  find(idOrRange: string | DateTimeRange): Entry | null | Array<Entry> {
    if (typeof idOrRange === 'string') {
      const node = this._lookup.get(idOrRange);

      if (node === undefined) {
        return null;
      }

      return this._store.get(node);
    }

    if (this._root === undefined) return [];

    let cursor: string | null = this._root.id;
    const ids: string[] = [];

    while (cursor !== null) {
      const node = this._node_lookup.get(cursor);

      if (node === undefined) throw Error('Not Implemented');

      if (node.startDate.isBetween(idOrRange) || node.endDate?.isBetween(idOrRange)) {
        ids.push(node.id);
      }

      cursor = node.next;
    }

    return ids.map((id) => this._store.get(this._lookup.get(id)!));
  }
}
