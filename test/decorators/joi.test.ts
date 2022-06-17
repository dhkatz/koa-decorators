import Koa from 'koa'
import Router from '@koa/router'
import bodyParser from 'koa-bodyparser'

import { Server } from 'http'
import { agent, SuperAgentTest } from 'supertest'

import { joi, method } from '../../src/decorators'
import { User } from '../models/User'
import { METADATA_KEY } from '../../src/constants'

describe('@joi decorator', () => {
  let app: Koa
  let server: Server
  let request: SuperAgentTest

  beforeEach(() => {
    app = new Koa()
    app.use(bodyParser())
    server = app.listen()
    request = agent(server)
  })

  afterEach(() => {
    server.close()
  })

  it('should be able to use the @joi decorator', () => {
    class Test {
      @method('get', '/test')
      @joi(User)
      public test(ctx) {
        console.log(ctx.request.body)
        ctx.body = 'test'
      }
    }

    const metadata = Reflect.getMetadata(METADATA_KEY.joi, Test, 'test')

    expect(metadata['$_terms']['keys'][0]['key']).toBe('name')
  })

  it('should throw if @joi is not passed a class', () => {
    expect(() => {
      class Test {
        // @ts-ignore
        @joi()
        public test() {
          return 'test'
        }
      }
    }).toThrowError()
  })

  it('should throw if @joi is not used on a method', () => {
    expect(() => {
      class Test {
        // @ts-ignore
        @joi(class User {})
        public test: string
      }
    }).toThrowError(/joi/)
  })

  it('should create a valid joi schema for validation', async () => {
    class Test {
      @method('post', '/test')
      @joi(User)
      public test(ctx) {
        ctx.body = ctx.request.body['name']
      }
    }

    const test = new Test()

    expect(Reflect.hasMetadata(METADATA_KEY.joi, Test, 'test')).toBe(true)

    const metadata = Reflect.getMetadata(METADATA_KEY.middleware, Test, 'test')

    expect(metadata).toHaveLength(1)
    expect(metadata[0]).toBeInstanceOf(Function)

    const router = new Router()

    router.post('/test', ...metadata, test.test.bind(test))

    app.use(router.routes())

    const response = await request.post('/test').send({ name: 'test' })

    expect(response.text).toBe('test')
  })
})
