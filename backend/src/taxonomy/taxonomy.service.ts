import { Injectable } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { DatabaseService } from '../database';
import { roleBenchmarks, skills, taxonomyDomains } from '../schema';
import { PILOT_DOMAINS, PILOT_ROLE_BENCHMARKS, PILOT_SKILLS } from './taxonomy.seed';

@Injectable()
export class TaxonomyService {
  private seeded = false;

  constructor(private readonly database: DatabaseService) {}

  async ensureSeeded() {
    if (this.seeded) return;

    const existing = await this.database.db.select({ id: taxonomyDomains.id }).from(taxonomyDomains).limit(1);
    if (existing.length > 0) {
      this.seeded = true;
      return;
    }

    await this.database.db.transaction(async (tx) => {
      for (const domain of PILOT_DOMAINS) {
        await tx.insert(taxonomyDomains).values(domain).onConflictDoNothing({ target: taxonomyDomains.slug });
      }
      const domainRows = await tx.select().from(taxonomyDomains);
      const domainIdBySlug = new Map(domainRows.map((d) => [d.slug, d.id]));

      for (const skill of PILOT_SKILLS) {
        const domainId = domainIdBySlug.get(skill.domainSlug);
        if (!domainId) continue;
        await tx.insert(skills).values({
          domainId,
          slug: skill.slug,
          name: skill.name,
          description: skill.description,
          escoUri: skill.escoUri,
          safetyCritical: skill.safetyCritical,
          requiredEvidence: skill.requiredEvidence,
        }).onConflictDoNothing({ target: skills.slug });
      }

      for (const role of PILOT_ROLE_BENCHMARKS) {
        const domainId = domainIdBySlug.get(role.domainSlug);
        if (!domainId) continue;
        await tx.insert(roleBenchmarks).values({
          domainId,
          slug: role.slug,
          title: role.title,
          description: role.description,
          requiredSkillSlugs: role.requiredSkillSlugs,
        }).onConflictDoNothing({ target: roleBenchmarks.slug });
      }
    });

    this.seeded = true;
  }

  async listDomains() {
    await this.ensureSeeded();
    const [domains, benchmarks] = await Promise.all([
      this.database.db.select().from(taxonomyDomains).orderBy(asc(taxonomyDomains.displayOrder)),
      this.database.db.select().from(roleBenchmarks).orderBy(asc(roleBenchmarks.title)),
    ]);

    return {
      version: 'v1',
      domains: domains.map((d) => ({
        ...d,
        roleBenchmarks: benchmarks.filter((b) => b.domainId === d.id),
      })),
    };
  }

  async listSkills(domainSlug?: string, query?: string) {
    await this.ensureSeeded();
    const rows = await this.database.db
      .select({
        id: skills.id,
        slug: skills.slug,
        name: skills.name,
        description: skills.description,
        escoUri: skills.escoUri,
        safetyCritical: skills.safetyCritical,
        requiredEvidence: skills.requiredEvidence,
        version: skills.version,
        domainId: taxonomyDomains.id,
        domainSlug: taxonomyDomains.slug,
        domainName: taxonomyDomains.name,
      })
      .from(skills)
      .innerJoin(taxonomyDomains, eq(skills.domainId, taxonomyDomains.id))
      .orderBy(asc(taxonomyDomains.displayOrder), asc(skills.name));

    const normalizedQuery = query?.trim().toLowerCase();
    const normalizedDomain = domainSlug?.trim().toLowerCase();

    return {
      version: 'v1',
      skills: rows.filter((row) => {
        if (normalizedDomain && row.domainSlug.toLowerCase() !== normalizedDomain) return false;
        if (normalizedQuery) {
          return (
            row.name.toLowerCase().includes(normalizedQuery) ||
            row.description.toLowerCase().includes(normalizedQuery) ||
            row.slug.toLowerCase().includes(normalizedQuery)
          );
        }
        return true;
      }),
    };
  }

  async getRoleBenchmark(roleSlug: string) {
    await this.ensureSeeded();
    const [benchmark] = await this.database.db
      .select()
      .from(roleBenchmarks)
      .where(eq(roleBenchmarks.slug, roleSlug))
      .limit(1);
    return benchmark ?? null;
  }
}
