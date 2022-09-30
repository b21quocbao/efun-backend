// eslint-disable-next-line
const Web3 = require('web3');
import {
  LatestBlockNetwork,
  STEP_BLOCK,
} from 'src/modules/latest-block/latest-block.const';
import { LatestBlockService } from 'src/modules/latest-block/latest-block.service';
import { eventABI } from '../contracts/abi/eventABI';
import { predictionABI } from '../contracts/abi/predictionABI';
import { AbiItem } from 'web3-utils';

export async function crawlSmartcontractEventsBatch(
  web3: any,
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

  const eventContract = new web3.eth.Contract(
    eventABI as AbiItem[],
    process.env.EVENT_PROXY,
  );
  const predictionContract = new web3.eth.Contract(
    predictionABI as AbiItem[],
    process.env.PREDICTION_PROXY,
  );

  const to = Math.min(cursor + STEP_BLOCK, await web3.eth.getBlockNumber());
  const params = { fromBlock: cursor + 1, toBlock: to };
  const eventsBatch = [];
  for (let idx = 0; idx < contracts.length; ++idx) {
    const contract = contracts[idx] ? eventContract : predictionContract;
    let events = await contract.getPastEvents(eventNames[idx], params);
    let events2 = [];
    if (process.env.RPC_URL_2 && process.env.RPC_URL_2.length > 0) {
      web3.setProvider(new Web3.providers.HttpProvider(process.env.RPC_URL_2));
      events2 = await contract.getPastEvents(eventNames[idx], params);
      web3.setProvider(new Web3.providers.HttpProvider(process.env.RPC_URL));
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
