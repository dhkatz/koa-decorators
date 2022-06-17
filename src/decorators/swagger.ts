import { getSchema } from 'joiful'
import j2s from 'joi-to-swagger'

import { METADATA_KEY } from '../constants'
import type { Class } from '../types'

import { joi } from './joi'

export const swagger = (type: string, value: any) => (target: any, name: string | symbol) => {
  const constructor = target instanceof Function ? target : target.constructor
  const metadata = Reflect.getMetadata(METADATA_KEY.swagger, constructor, name) || {}

  Reflect.defineMetadata(METADATA_KEY.swagger, { ...metadata, [type]: value }, constructor, name)
}

export const summary = (value: string) => swagger('summary', value)

export const description = (value: string) => swagger('description', value)

export const deprecated = (value = true) => swagger('deprecated', value)

export const schema =
  (path: any, value: Class) =>
  (target: any, name: string | symbol, descriptor: PropertyDescriptor) => {
    const constructor = target instanceof Function ? target : target.constructor

    if (!name || !descriptor || typeof descriptor.value !== 'function') {
      throw new Error('@schema decorator must be applied to a method')
    }

    const schema = getSchema(value)

    if (!schema) {
      throw new Error(`${value.name} does not have a valid Joi schema`)
    }

    const { components } = j2s(schema.meta({ className: value.name }))

    joi(value)(target, name, descriptor)

    for (const [k, v] of Object.entries(path)) {
      swagger(k, v)(target, name)
    }

    const schemas = Reflect.getMetadata(METADATA_KEY.schemas, constructor, name) || {}

    Reflect.defineMetadata(
      METADATA_KEY.schemas,
      { ...schemas, ...components.schemas },
      constructor,
      name
    )
  }

export const body = (value: Class, type = 'application/json') =>
  schema(
    {
      requestBody: {
        content: { [type]: { schema: { $ref: `#/components/schemas/${value.name}` } } },
      },
    },
    value
  )

type Response = {
  (value: Class, type?: string): MethodDecorator
  (code: number, value: Class, type?: string): MethodDecorator
}

export const response: Response = (code: number | Class, value: Class | string, type?: string) =>
  schema(
    {
      responses: {
        [typeof code === 'number' ? code : '200']: {
          content: {
            [typeof value !== 'function' ? value ?? 'application/json' : type]: {
              schema: {
                $ref: `#/components/schemas/${
                  typeof value !== 'function' ? (code as Class).name : value.name
                }`,
              },
            },
          },
        },
      },
    },
    typeof code === 'number' ? (value as Class) : code
  )
