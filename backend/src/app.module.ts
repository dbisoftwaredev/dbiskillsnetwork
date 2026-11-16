import { Controller, Get, Module, ServiceUnavailableException } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthModule } from './auth/auth.module';
import { DatabaseService } from './database';
import { DatabaseModule } from './database.module';
import { OrganizationModule } from './organizations/organization.module';

class HealthResponseDto {
  @ApiProperty({ example: 'ok' })
  status!: string;

  @ApiProperty({ example: 'dbi-api' })
  service!: string;
}

class ReadinessResponseDto {
  @ApiProperty({ example: 'ready' })
  status!: string;

  @ApiProperty({ example: 'connected' })
  database!: string;
}

@Controller('health')
@ApiTags('Health')
export class HealthController {
  constructor(private readonly database: DatabaseService) {}

  @Get()
  @ApiOperation({ summary: 'Check API process liveness' })
  @ApiOkResponse({ type: HealthResponseDto, schema: { example: { status: 'ok', service: 'dbi-api' } } })
  live() { return { status: 'ok', service: 'dbi-api' }; }

  @Get('ready')
  @ApiOperation({ summary: 'Check PostgreSQL readiness' })
  @ApiOkResponse({ type: ReadinessResponseDto, schema: { example: { status: 'ready', database: 'connected' } } })
  @ApiResponse({
    status: 503,
    description: 'PostgreSQL is not configured or is unavailable',
    schema: { example: { statusCode: 503, message: { status: 'not_ready', database: 'unavailable' } } },
  })
  async ready() {
    const database = await this.database.check();
    if (database !== 'connected') throw new ServiceUnavailableException({ status: 'not_ready', database });
    return { status: 'ready', database };
  }
}

@Module({
  imports: [DatabaseModule, AuthModule, OrganizationModule],
  controllers: [HealthController],
})
export class AppModule {}
