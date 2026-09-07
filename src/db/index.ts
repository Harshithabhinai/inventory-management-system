// CommonJS-style database bootstrap to avoid ESM/Runtime parsing issues in certain dev environments
/* eslint-disable @typescript-eslint/no-var-requires */
const { drizzle } = require("drizzle-orm/node-postgres");
const { Pool } = require("pg");
const schema = require("./schema");

const databaseUrl = process.env.DATABASE_URL;

let poolVar = undefined;
let dbVar = undefined;

if (!databaseUrl) {
  // Provide a safe mock `db` so importing modules won't throw at startup.
  // Lightweight chainable mock query that resolves to empty array when awaited.
  const makeMockQuery = () => {
    const q: any = {
      from: () => q,
      leftJoin: () => q,
      rightJoin: () => q,
      innerJoin: () => q,
      orderBy: () => q,
      groupBy: () => q,
      where: () => q,
      returning: () => q,
      values: () => q,
      set: () => q,
      then: (onFulfilled: any, onRejected?: any) => Promise.resolve([]).then(onFulfilled, onRejected),
      catch: (onRejected?: any) => Promise.resolve([]).catch(onRejected),
    };
    return q;
  };

  poolVar = undefined;
  dbVar = {
    select: () => makeMockQuery(),
    insert: () => makeMockQuery(),
    update: () => makeMockQuery(),
    delete: () => makeMockQuery(),
    transaction: async (cb: any) => {
      if (typeof cb === "function") {
        return cb();
      }
      return [];
    },
  };
} else {
  const globalForDb = globalThis as typeof globalThis & {
    __arenaNextJsPostgresqlPool?: any;
  };

  poolVar =
    globalForDb.__arenaNextJsPostgresqlPool ??
    new Pool({
      connectionString: databaseUrl,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__arenaNextJsPostgresqlPool = poolVar;
  }

  dbVar = drizzle(poolVar, { schema });
}

export const pool = poolVar;
export const db = dbVar;

export default {
  pool: poolVar,
  db: dbVar,
};
