
import type { Knex } from 'knex';

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'better-sqlite3',
    connection: {
      filename: './db.sqlite3'
    },
    useNullAsDefault: true,
    migrations: {
      directory: './migrations',
      extension: 'ts'
    }
  }
};

export default config;