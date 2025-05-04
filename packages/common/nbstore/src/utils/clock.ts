export class ClockMap {
  max: Date = new Date(0);
  constructor(private readonly map: Map<string, Date>) {
    for (const value of map.values()) {
      if (value.getTime() > this.max.getTime()) {
        this.max = value;
      }
    }
  }

  get(id: string): Date {
    return this.map.get(id) ?? new Date(0);
  }

  set(id: string, value: Date) {
    this.map.set(id, value);
    if (value.getTime() > this.max.getTime()) {
      this.max = value;
    }
  }

  setIfBigger(id: string, value: Date) {
    if (value.getTime() > this.get(id).getTime()) {
      this.set(id, value);
      return true;
    }
    return false;
  }

  clear() {
    this.map.clear();
    this.max = new Date(0);
  }

  keys() {
    return Array.from(this.map.keys());
  }
}
