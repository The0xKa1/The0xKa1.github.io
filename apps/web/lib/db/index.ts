import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

let db: ReturnType<typeof drizzle>;

function createMockDb() {
  // Return a proxy that returns empty arrays for all queries
  return new Proxy({} as any, {
    get(target, prop) {
      if (prop === "select" || prop === "insert" || prop === "delete" || prop === "update") {
        return () => createMockDb();
      }
      if (prop === "from" || prop === "where" || prop === "orderBy" || prop === "limit" || prop === "innerJoin") {
        return () => createMockDb();
      }
      if (prop === "then") {
        return (resolve: any) => resolve([]);
      }
      if (prop === "returning") {
        return () => createMockDb();
      }
      if (prop === "values") {
        return () => createMockDb();
      }
      if (prop === "onConflictDoUpdate" || prop === "onConflictDoNothing") {
        return () => createMockDb();
      }
      return () => createMockDb();
    },
  });
}

try {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle(pool, { schema });
} catch {
  console.warn("Database connection failed, using mock DB");
  db = createMockDb() as any;
}

export { db };
