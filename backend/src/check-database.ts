import 'reflect-metadata';
import { DatabaseService } from './database';

async function main() {
  const database = new DatabaseService();
  try {
    const status = await database.check();
    console.log(`PostgreSQL: ${status}`);
    if (status !== 'connected') process.exitCode = 1;
  } finally { await database.onModuleDestroy(); }
}
main().catch(() => { console.error('Invalid database configuration. Check DATABASE_URL.'); process.exitCode = 1; });
