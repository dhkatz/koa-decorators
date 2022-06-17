import Router from '@koa/router'

import { METADATA_KEY } from './constants'
import { Class } from './types'
import ui from './ui'

export const bind = (root: Router, ...classes: Class[]) => {
  const openapi = {
    openapi: '3.0.0',
    info: {
      title: 'API',
      version: '1.0.0',
    },
    paths: {},
    components: {
      schemas: {},
    },
  }

  for (const cls of classes) {
    // Ensure that the class has a @controller decorator
    const controller = Reflect.getMetadata(METADATA_KEY.controller, cls)

    if (!controller) {
      throw new Error(`${cls.name} is not a controller`)
    }

    // Create a new router for the controller
    const router = new Router()

    // Create a new instance of the class
    const instance = new cls()

    // Build routes and openapi definitions using decorated class methods
    const properties = Reflect.ownKeys(cls.prototype)
    for (const property of properties) {
      if (property === 'constructor') {
        continue // Skip constructor
      }

      const descriptor = Reflect.getOwnPropertyDescriptor(cls.prototype, property)

      if (!descriptor || !descriptor.value || typeof descriptor.value !== 'function') {
        continue // Skip non-methods
      }

      const method = Reflect.getMetadata(METADATA_KEY.method, cls, property)

      if (!method) {
        continue // Skip methods without @method decorator
      }

      // Bind the method to the instance
      const handler = descriptor.value.bind(instance)

      const middleware = Reflect.getMetadata(METADATA_KEY.middleware, cls, property) ?? []

      // Add the middleware and handler to the router
      router[method.method](method.name, method.path, ...middleware, handler)

      const swagger = Reflect.getMetadata(METADATA_KEY.swagger, cls, property)

      if (swagger) {
        // Replace router parameter with openapi parameter
        const path = `${controller.path}${method.path}`.replace(/:([^/]+)/g, '{$1}')

        // Add the swagger definition to the openapi object
        openapi.paths[path] = {
          [method.method]: {
            ...swagger,
          },
        }
      }

      const schemas = Reflect.getMetadata(METADATA_KEY.schemas, cls, property)

      if (schemas) {
        // Add the schemas to the openapi object
        openapi.components.schemas = {
          ...openapi.components.schemas,
          ...schemas,
        }
      }
    }

    const middleware = Reflect.getMetadata(METADATA_KEY.middleware, cls) ?? []

    // Add the router to the parent router
    root.use(controller.path, ...middleware, router.routes(), router.allowedMethods())
  }

  root.get(
    '/docs',
    ui.middleware({
      swagger: {
        spec: openapi,
      },
    })
  )
}
