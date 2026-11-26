import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DatabaseModule } from '../database.module';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';

@Module({
  imports: [DatabaseModule, JwtModule.register({})],
  controllers: [StorageController],
  providers: [StorageService, JwtAuthGuard],
  exports: [StorageService],
})
export class StorageModule {}
