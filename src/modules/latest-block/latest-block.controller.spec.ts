import { Test, TestingModule } from '@nestjs/testing';
import { LatestBlockController } from './latest-block.controller';
import { LatestBlockService } from './latest-block.service';

describe('LatestBlockController', () => {
  let controller: LatestBlockController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LatestBlockController],
      providers: [LatestBlockService],
    }).compile();

    controller = module.get<LatestBlockController>(LatestBlockController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
