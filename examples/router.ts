import Koa from 'koa'

import Router from '@koa/router'
import { string } from 'joiful'

import { response, controller, description, get, method, summary } from '../src'
import { bind } from '../src'

class User {
  @string().required()
  public name: string

  public static async get(id: string) {
    return {
      id,
    }
  }

  public static async create({ name }: { name: string }) {
    return {
      name,
    }
  }
}

@controller('/users')
class Users {
  @get('/:id')
  @response(User)
  @description('Get user by id')
  @summary('Get user by id')
  public async get(ctx) {
    ctx.body = {
      id: ctx.params.id,
      name: 'John',
    }
  }

  @method('post', '/')
  public async create(ctx) {}

  @method('get', '/')
  public async getAll(ctx) {}
}

const app = new Koa()

const router = new Router({ prefix: '/api' })

bind(router, Users)

app.use(router.routes())

app.listen(3000)
