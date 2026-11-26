import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EvaluateExplorerDto } from './explorer.dto';
import { ExplorerService } from './explorer.service';

@Controller('public')
@ApiTags('Public Explorer')
export class ExplorerController {
  constructor(private readonly explorer: ExplorerService) {}

  @Post('career-readiness-explorer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unauthenticated 5-question Career Readiness Explorer returning a provisional gap snapshot and single-use handoff token' })
  @ApiOkResponse({ description: 'Provisional skills-gap snapshot and 24-hour single-use handoff token' })
  @ApiNotFoundResponse({ description: 'Unknown role benchmark slug' })
  evaluate(@Body() body: EvaluateExplorerDto) {
    return this.explorer.evaluate(body);
  }
}
