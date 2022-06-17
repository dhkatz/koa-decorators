export const TYPE = {
  Resource: Symbol.for('Resource'),
}

export const METADATA_KEY = {
  controller: Symbol.for('controller'),
  method: Symbol.for('method'),
  parameters: Symbol.for('parameters'),
  swagger: Symbol.for('swagger'),
  schemas: Symbol.for('schemas'),
  middleware: Symbol.for('middleware'),
  joi: Symbol.for('joi'),
}

export type PARAMETER =
  | 'request'
  | 'response'
  | 'body'
  | 'query'
  | 'path'
  | 'header'
  | 'cookie'
  | 'next'
  | 'ctx'
