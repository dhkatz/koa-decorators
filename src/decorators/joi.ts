import { getSchema } from 'joiful'

import type { Class } from '../types'
import { METADATA_KEY } from '../constants'

import { middleware } from './router'

export const joi = (cls: Class) => {
  if (!cls) {
    throw new Error('Must provide a class to @joi for validation!')
  }

  const schema = getSchema(cls)

  return (target: any, name: string | symbol, descriptor: PropertyDescriptor) => {
    const constructor = target instanceof Function ? target : target.constructor

    if (!name || !descriptor || typeof descriptor.value !== 'function') {
      throw new Error(`@joi decorator must be applied to a method`)
    }

    if (Reflect.hasMetadata(METADATA_KEY.joi, constructor, name)) {
      throw new Error(`Method ${constructor.name}.${String(name)} already has a @joi decorator`)
    }

    Reflect.defineMetadata(METADATA_KEY.joi, schema, constructor, name)

    middleware(async (ctx, next) => {
      try {
        ctx.request.body = await schema.validateAsync(ctx.request.body ?? {})
      } catch (err) {
        ctx.throw(400, err.message)
      }

      await next()
    })(target, name, descriptor)
  }
}
