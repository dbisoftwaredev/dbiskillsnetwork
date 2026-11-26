import { createHash, randomBytes } from 'node:crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database';
import { explorerSnapshots } from '../schema';
import { TaxonomyService } from '../taxonomy/taxonomy.service';
import { EvaluateExplorerDto } from './explorer.dto';
import { evaluateExplorerCheck } from './explorer.policy';

const EXPLORER_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class ExplorerService {
  constructor(
    private readonly database: DatabaseService,
    private readonly taxonomy: TaxonomyService,
  ) {}

  async evaluate(input: EvaluateExplorerDto) {
    const benchmark = await this.taxonomy.getRoleBenchmark(input.roleSlug);
    if (!benchmark) {
      throw new NotFoundException(`Unknown role benchmark: ${input.roleSlug}`);
    }

    const evaluation = evaluateExplorerCheck({
      requiredSkillSlugs: benchmark.requiredSkillSlugs,
      knownSkillSlugs: input.knownSkillSlugs,
      experienceYears: input.experienceYears,
      hasFieldSafetyTraining: input.hasFieldSafetyTraining,
      hasVendorCertification: input.hasVendorCertification,
    });

    const handoffToken = randomBytes(24).toString('base64url');
    const tokenHash = createHash('sha256').update(handoffToken).digest('hex');
    const expiresAt = new Date(Date.now() + EXPLORER_TOKEN_TTL_MS);

    const [snapshot] = await this.database.db.insert(explorerSnapshots).values({
      tokenHash,
      roleSlug: benchmark.slug,
      readinessBand: evaluation.readinessBand,
      readinessScore: evaluation.readinessScore,
      matchedSkillSlugs: evaluation.matchedSkillSlugs,
      missingSkillSlugs: evaluation.missingSkillSlugs,
      answers: {
        experienceYears: input.experienceYears,
        hasFieldSafetyTraining: input.hasFieldSafetyTraining,
        hasVendorCertification: input.hasVendorCertification,
        knownSkillSlugs: input.knownSkillSlugs,
      },
      expiresAt,
    }).returning({ id: explorerSnapshots.id, expiresAt: explorerSnapshots.expiresAt });

    return {
      event: 'explorer.snapshot_created.v1',
      snapshotId: snapshot.id,
      roleSlug: benchmark.slug,
      roleTitle: benchmark.title,
      taxonomyVersion: benchmark.version,
      ...evaluation,
      handoffToken,
      expiresAt: snapshot.expiresAt,
    };
  }
}
