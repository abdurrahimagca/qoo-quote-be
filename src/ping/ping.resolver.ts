import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { PingService } from './ping.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';


@Resolver()
export class PingResolver {
  constructor(private readonly pingService: PingService) { }

  @Query(() => String)
  async ping(): Promise<string> {
    return this.pingService.getPing();
  }

  @Query(() => String)
  @UseGuards(JwtAuthGuard)
  async protected(): Promise<string> {
    return 'This is a protected route';
  }


  @Mutation(() => String)
  async pong(@Args('pong') pong: string): Promise<string> {
    const savedPing = await this.pingService.savePing(pong);
    return `Saved: ${savedPing.pong}`;
  }
}
