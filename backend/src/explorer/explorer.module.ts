import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database.module';
import { TaxonomyModule } from '../taxonomy/taxonomy.module';
import { ExplorerController } from './explorer.controller';
import { ExplorerService } from './explorer.service';

@Module({
  imports: [DatabaseModule, TaxonomyModule],
  controllers: [ExplorerController],
  providers: [ExplorerService],
})
export class ExplorerModule {}
