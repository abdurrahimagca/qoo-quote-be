import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ping } from './ping.entity';
import { PingService } from './ping.service';
import { PingResolver } from './ping.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Ping])],
  providers: [PingService, PingResolver],
})
export class PingModule {}
