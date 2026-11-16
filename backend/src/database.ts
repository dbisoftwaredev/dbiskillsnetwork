import { Injectable, OnModuleDestroy, ServiceUnavailableException } from '@nestjs/common';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { readConfig } from './config';
import { schema } from './schema';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly pool: Pool | undefined;
  private readonly client: NodePgDatabase<typeof schema> | undefined;

  constructor() {
    const url = readConfig().databaseUrl;
    if (url) {
      this.pool = new Pool({ connectionString: url, connectionTimeoutMillis: 3000, query_timeout: 3000, max: 5 });
      this.client = drizzle(this.pool, { schema });
    }
  }

  get db(): NodePgDatabase<typeof schema> {
    if (!this.client) throw new ServiceUnavailableException('PostgreSQL is not configured');
    return this.client;
  }

  async check(): Promise<'connected' | 'unconfigured' | 'unavailable'> {
    if (!this.pool) return 'unconfigured';
    try { await this.pool.query('SELECT 1'); return 'connected'; }
    catch { return 'unavailable'; }
  }

  async onModuleDestroy() { await this.pool?.end(); }
}
