// eslint-disable-next-line
const Web3 = require('web3');
import {
  LatestBlockNetwork,
  STEP_BLOCK,
} from 'src/modules/latest-block/latest-block.const';
import { LatestBlockService } from 'src/modules/latest-block/latest-block.service';
import { AbiItem } from 'web3-utils';

export async function crawlSmartcontractEventsBatch(
  web3: any,
  web3_2: any,
  latestBlockService: LatestBlockService,
  // eslint-disable-next-line
  contracts: any[],
  eventNames: string[],
  callbacks: ((event: any) => Promise<void>)[],
): Promise<void> {
  let cursor = Number(process.env.START_BLOCK);
  const latestBlock = await latestBlockService.getLatestBlock(
    LatestBlockNetwork.BSC,
    'crawl-all',
  );
  if (latestBlock.block) cursor = Number(latestBlock.block);

  const { predictionABI } = await import(
    `../../shares/contracts/abi/${process.env.APP_ENV}/predictionABI`
  );
  const { eventABI } = await import(
    `../../shares/contracts/abi/${process.env.APP_ENV}/eventABI`
  );
  const { elpTokenABI } = await import(
    `../../shares/contracts/abi/${process.env.APP_ENV}/elpTokenABI`
  );

  const web3Contracts = [
    new web3.eth.Contract(eventABI as AbiItem[], process.env.EVENT_PROXY),
    new web3.eth.Contract(
      predictionABI as AbiItem[],
      process.env.PREDICTION_PROXY,
    ),
    new web3.eth.Contract(
      elpTokenABI as AbiItem[],
      process.env.ELP_TOKEN_PROXY,
    ),
  ];
  const web3Contracts2 = [
    new web3_2.eth.Contract(eventABI as AbiItem[], process.env.EVENT_PROXY),
    new web3_2.eth.Contract(
      predictionABI as AbiItem[],
      process.env.PREDICTION_PROXY,
    ),
    new web3_2.eth.Contract(
      elpTokenABI as AbiItem[],
      process.env.ELP_TOKEN_PROXY,
    ),
  ];

  const to = Math.min(cursor + STEP_BLOCK, await web3.eth.getBlockNumber());
  const params = { fromBlock: cursor + 1, toBlock: to };
  const eventsBatch = [];
  for (let idx = 0; idx < contracts.length; ++idx) {
    const contract = web3Contracts[contracts[idx]];
    let events = await contract.getPastEvents(eventNames[idx], params);
    let events2 = [];
    if (process.env.RPC_URL_2 && process.env.RPC_URL_2.length > 0) {
      const contract = web3Contracts2[contracts[idx]];
      events2 = await contract.getPastEvents(eventNames[idx], params);
    }

    events = events.concat(events2);
    events = events.filter(
      (val: any, idx: any) =>
        events
          .map((val: any) => JSON.stringify(val))
          .indexOf(JSON.stringify(val)) == idx,
    );
    eventsBatch.push(events);
  }

  for (let idx = 0; idx < eventsBatch.length; idx++) {
    const events = eventsBatch[idx];
    const callback = callbacks[idx];
    for (const event of events) {
      await callback(event);
    }
  }

  cursor = to;
  await latestBlockService.saveLatestBlock(
    LatestBlockNetwork.BSC,
    'crawl-all',
    to.toString(),
  );
}
