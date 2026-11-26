import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { TaxonomyService } from './taxonomy.service';

@Controller('taxonomy')
@ApiTags('Taxonomy')
export class TaxonomyController {
  constructor(private readonly taxonomy: TaxonomyService) {}

  @Get('domains')
  @ApiOperation({ summary: 'List the 6 Telecom/ICT domains and pilot role benchmarks (public)' })
  @ApiOkResponse({ description: 'Versioned telecom domains and role benchmarks' })
  listDomains() {
    return this.taxonomy.listDomains();
  }

  @Get('skills')
  @ApiOperation({ summary: 'Searchable Telecom/ICT skills registry (public)' })
  @ApiQuery({ name: 'domain', required: false, description: 'Filter by domain slug' })
  @ApiQuery({ name: 'q', required: false, description: 'Search by skill name, slug, or description' })
  @ApiOkResponse({ description: 'Matching taxonomy skills with safety-critical flags and evidence requirements' })
  listSkills(@Query('domain') domain?: string, @Query('q') q?: string) {
    return this.taxonomy.listSkills(domain, q);
  }
}
