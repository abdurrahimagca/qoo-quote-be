import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ping } from './ping.entity';
import { User } from 'src/auth/user.entity';

@Injectable()
export class PingService {
  constructor(
    @InjectRepository(Ping)
    private pingRepository: Repository<Ping>,

  ) { }

  async getPing(): Promise<string> {
    const latestPing = await this.pingRepository.findOne({
      where: {},
      order: { id: 'DESC' },
    });

    return latestPing ? latestPing.pong : 'No data found';
  }


  async savePing(pong: string): Promise<Ping> {
    const ping = this.pingRepository.create({ pong });
    return this.pingRepository.save(ping);
  }
}
