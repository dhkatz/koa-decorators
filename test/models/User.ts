import { string } from 'joiful'

export class User {
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
