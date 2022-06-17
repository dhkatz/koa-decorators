import type { Middleware } from '@koa/router'

import { METADATA_KEY } from '../constants'

/**
 * Decorate a class as a controller (router).
 * @param path
 */
export const controller =
  (path: string): ClassDecorator =>
  (target: any) => {
    if (Reflect.hasMetadata(METADATA_KEY.controller, target)) {
      throw new Error(`Class ${target.name} already has a @controller decorator`)
    }

    Reflect.defineMetadata(METADATA_KEY.controller, { path, target }, target)
  }

export const method =
  (method: string, path: string): MethodDecorator =>
  (target: any, name: string | symbol, descriptor: PropertyDescriptor) => {
    const constructor = target instanceof Function ? target : target.constructor

    if (!name || !descriptor || typeof descriptor.value !== 'function') {
      throw new Error('@method decorator must be applied to a method')
    }

    if (Reflect.hasMetadata(METADATA_KEY.method, constructor, name)) {
      throw new Error(`Method ${constructor.name}.${String(name)} already has a @method decorator`)
    }

    Reflect.defineMetadata(METADATA_KEY.method, { method, path, name }, constructor, name)

    return descriptor
  }

export const all = (path: string) => method('all', path)

export const get = (path: string) => method('get', path)

export const post = (path: string) => method('post', path)

export const put = (path: string) => method('put', path)

export const patch = (path: string) => method('patch', path)

export const del = (path: string) => method('delete', path)

export const head = (path: string) => method('head', path)

export const params =
  (type: string, name: string) =>
  (target: any, name: string | symbol, descriptor: PropertyDescriptor) => {}

export const middleware =
  (middleware: Middleware) =>
  (target: any, name?: string | symbol, descriptor?: PropertyDescriptor) => {
    const constructor = target instanceof Function ? target : target.constructor

    if ((name && !descriptor) || (descriptor && typeof descriptor.value !== 'function')) {
      throw new Error('@middleware decorator must be applied to a method or a class')
    }

    const metadata = Reflect.getMetadata(METADATA_KEY.middleware, constructor, name) || []

    Reflect.defineMetadata(METADATA_KEY.middleware, [...metadata, middleware], constructor, name)

    return descriptor
  }
