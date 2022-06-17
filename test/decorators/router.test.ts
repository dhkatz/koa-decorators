/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars  */

import Koa from 'koa'
import Router from '@koa/router'

import { agent, SuperAgentTest } from 'supertest'
import { Server } from 'http'

import { controller, method, middleware, joi } from '../../src/decorators'
import { METADATA_KEY } from '../../src/constants'

import { User } from '../models/User'

describe('@controller decorator', () => {
  it('should be able to use the @controller decorator', () => {
    @controller('/')
    class Test {}

    const metadata = Reflect.getMetadata(METADATA_KEY.controller, Test)

    expect(metadata).toEqual({
      path: '/',
      target: Test,
    })
  })

  it('should throw if @controller is used more than once', () => {
    expect(() => {
      @controller('/')
      @controller('/')
      class Test {}
    }).toThrowError(/controller/)
  })
})

describe('@method decorator', () => {
  it('should be able to use the @method decorator', () => {
    class Test {
      @method('get', '/test')
      public test() {
        return 'test'
      }
    }

    const test = new Test()

    expect(test.test()).toBe('test')

    const metadata = Reflect.getMetadata(METADATA_KEY.method, Test, 'test')

    expect(metadata).toEqual({
      method: 'get',
      name: 'test',
      path: '/test',
    })
  })

  it('should throw if @method is used more than once', () => {
    expect(() => {
      class Test {
        @method('get', '/test')
        @method('get', '/test')
        public test() {
          return 'test'
        }
      }
    }).toThrowError(/method/)
  })

  it('should throw if @method is used on a non-function', () => {
    expect(() => {
      class Test {
        // @ts-ignore
        @method('get', '/test')
        public test: string
      }
    }).toThrowError(/method/)
  })
})

describe('@middleware decorator', () => {
  let app: Koa
  let server: Server
  let request: SuperAgentTest

  beforeEach(() => {
    app = new Koa()
    server = app.listen()
    request = agent(server)
  })

  afterEach(() => {
    server.close()
  })

  it('should be able to use the @middleware decorator', async () => {
    class Test {
      @middleware((ctx, next) => {
        ctx.status = 201
        return next()
      })
      public async test(ctx) {
        ctx.body = 'test'
      }
    }

    const test = new Test()

    const metadata = Reflect.getMetadata(METADATA_KEY.middleware, Test, 'test')

    expect(metadata).toHaveLength(1)
    expect(metadata[0]).toBeInstanceOf(Function)

    const router = new Router()

    router.get('/test', ...metadata, test.test.bind(test))

    app.use(router.routes())

    const response = await request.get('/test')

    expect(response.text).toBe('test')
    expect(response.status).toBe(201) // middleware
  })

  it('should work with multiple @middleware decorators', async () => {
    class Test {
      @middleware((ctx, next) => {
        ctx.status = 201
        return next()
      })
      @middleware((ctx, next) => {
        ctx.set('X-Test', 'test')
        return next()
      })
      public test(ctx) {
        ctx.body = 'test'
      }
    }

    const test = new Test()

    const metadata = Reflect.getMetadata(METADATA_KEY.middleware, Test, 'test')

    expect(metadata).toHaveLength(2)
    expect(metadata[0]).toBeInstanceOf(Function)
    expect(metadata[1]).toBeInstanceOf(Function)

    const router = new Router()

    router.get('/test', ...metadata, test.test.bind(test))

    app.use(router.routes())

    const response = await request.get('/test')

    expect(response.text).toBe('test')
    expect(response.status).toBe(201) // middleware
    expect(response.headers['x-test']).toBe('test')
  })

  it('should throw if @middleware is used on a non-function', () => {
    expect(() => {
      class Test {
        // @ts-ignore
        @middleware()
        public test: string
      }
    }).toThrowError(/middleware/)
  })
})
