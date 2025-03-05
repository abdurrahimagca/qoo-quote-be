import { Test, TestingModule } from '@nestjs/testing';
import { PingResolver } from './ping.resolver';

describe('PingResolver', () => {
  let resolver: PingResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PingResolver],
    }).compile();

    resolver = module.get<PingResolver>(PingResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
