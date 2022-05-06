import { Test, TestingModule } from '@nestjs/testing';
import { LatestBlockService } from './latest-block.service';

describe('LatestBlockService', () => {
  let service: LatestBlockService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LatestBlockService],
    }).compile();

    service = module.get<LatestBlockService>(LatestBlockService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
