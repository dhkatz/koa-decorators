export type Constructor<T> = new (...args: any[]) => T

export type Class = Constructor<any>
