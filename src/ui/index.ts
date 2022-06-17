import handlebars from 'handlebars'
import fs from 'fs'
import path from 'path'

import type { SwaggerUIOptions } from 'swagger-ui'
import type Koa from 'koa'

export interface UIOptions {
  /**
   * The title of the Swagger UI page.
   */
  title: string
  /**
   * The version of Swagger UI to use.
   * @example '4.9.1'
   */
  version: string
  swagger: SwaggerUIOptions
}

const defaults: UIOptions = {
  title: 'Swagger UI',
  version: '4.9.1',
  swagger: {
    dom_id: '#swagger-ui',
    url: 'https://petstore.swagger.io/v2/swagger.json',
    layout: 'StandaloneLayout',
  },
}

/**
 * Generates a Swagger UI page.
 * @param options
 * @return {string} The generated HTML.
 */
export function render(options: Partial<UIOptions> = {}): string {
  const opts = { ...defaults, ...options } // We don't care about deep cloning because we don't mutate the defaults

  handlebars.registerHelper('json', (context) => JSON.stringify(context))

  const input = fs.readFileSync(path.join(__dirname, 'index.hbs'), 'utf8')

  const template = handlebars.compile(input)

  return template(opts)
}

/**
 * Koa middleware that renders the Swagger UI page.
 * @param options
 */
export function middleware(options: Partial<UIOptions> = {}): Koa.Middleware {
  const html = render(options)

  return (ctx) => {
    ctx.type = 'text/html'
    ctx.body = html
    return true
  }
}

export default {
  render,
  middleware,
}
