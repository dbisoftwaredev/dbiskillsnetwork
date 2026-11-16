import { Injectable } from '@nestjs/common';
import { auditLogs } from '../schema';
import { DatabaseService } from '../database';

export interface AuditEntry {
  actorUserId: string | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
}

type Executor = Pick<DatabaseService['db'], 'insert'>;

@Injectable()
export class AuditService {
  constructor(private readonly database: DatabaseService) {}

  /** Record an audit entry; pass a transaction to make it atomic with the change. */
  async record(entry: AuditEntry, executor: Executor = this.database.db) {
    await executor.insert(auditLogs).values({
      actorUserId: entry.actorUserId,
      action: entry.action,
      targetType: entry.targetType,
      targetId: entry.targetId ?? null,
      metadata: entry.metadata ?? null,
    });
  }
}

