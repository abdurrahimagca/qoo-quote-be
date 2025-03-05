import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { PingService } from './ping.service';

@Resolver()
export class PingResolver {
  constructor(private readonly pingService: PingService) {}

  @Query(() => String)
  async ping(): Promise<string> {
    return this.pingService.getPing();
  }

  @Mutation(() => String)
  async pong(@Args('pong') pong: string): Promise<string> {
    const savedPing = await this.pingService.savePing(pong);
    return `Saved: ${savedPing.pong}`;
  }
}
