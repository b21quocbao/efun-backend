import {
  BLOCK_TIME,
  LatestBlockNetwork,
  STEP_BLOCK,
} from 'src/modules/latest-block/latest-block.const';
import { LatestBlockService } from 'src/modules/latest-block/latest-block.service';

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function crawlSmartcontractEvents(
  startingBlock: number,
  web3: any,
  latestBlockService: LatestBlockService,
  // eslint-disable-next-line
  contract: any,
  eventName: string,
  callback: (event) => void,
): Promise<void> {
  let cursor = startingBlock;
  const latestBlock = await latestBlockService.getLatestBlock(
    LatestBlockNetwork.BSC,
    eventName,
  );
  if (latestBlock.block) cursor = Number(latestBlock.block);

  while (true) {
    const to = Math.min(cursor + STEP_BLOCK, await web3.eth.getBlockNumber());
    const params = { fromBlock: cursor + 1, toBlock: to };
    const events = await contract.getPastEvents(eventName, params);

    for (const event of events) {
      callback(event);
    }
    cursor = to;
    await latestBlockService.saveLatestBlock(
      LatestBlockNetwork.BSC,
      eventName,
      to.toString(),
    );
    await sleep(BLOCK_TIME);
  }
}

export async function crawlSmartcontractEventsBatch(
  startingBlock: number,
  web3: any,
  latestBlockService: LatestBlockService,
  // eslint-disable-next-line
  contracts: any[],
  eventNames: string[],
  callbacks: ((event) => void)[],
): Promise<void> {
  let cursor = startingBlock;
  const latestBlock = await latestBlockService.getLatestBlock(
    LatestBlockNetwork.BSC,
    'crawl-all',
  );
  if (latestBlock.block) cursor = Number(latestBlock.block);

  while (true) {
    const to = Math.min(cursor + STEP_BLOCK, await web3.eth.getBlockNumber());
    const params = { fromBlock: cursor + 1, toBlock: to };
    const eventsBatch = await Promise.all(
      contracts.map((contract, idx) =>
        contract.getPastEvents(eventNames[idx], params),
      ),
    );

    for (let idx = 0; idx < eventsBatch.length; idx++) {
      const events = eventsBatch[idx];
      const callback = callbacks[idx];
      for (const event of events) {
        callback(event);
      }
    }

    cursor = to;
    await latestBlockService.saveLatestBlock(
      LatestBlockNetwork.BSC,
      'crawl-all',
      to.toString(),
    );
    await sleep(BLOCK_TIME);
  }
}
