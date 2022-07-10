// eslint-disable-next-line
const Web3 = require('web3');
import {
  BLOCK_TIME,
  LatestBlockNetwork,
  STEP_BLOCK,
} from 'src/modules/latest-block/latest-block.const';
import { LatestBlockService } from 'src/modules/latest-block/latest-block.service';
import { eventABI } from '../contracts/abi/eventABI';
import { predictionABI } from '../contracts/abi/predictionABI';
import { AbiItem } from 'web3-utils';

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
  callbacks: ((event: any) => Promise<void>)[],
): Promise<void> {
  let cursor = startingBlock;
  const latestBlock = await latestBlockService.getLatestBlock(
    LatestBlockNetwork.BSC,
    'crawl-all',
  );
  if (latestBlock.block) cursor = Number(latestBlock.block);
  let alter = false;
  let switched = true;
  let eventContract, predictionContract;

  while (true) {
    const hour = new Date().getUTCHours();
    const day = new Date().getUTCDay();
    if (
      process.env.RPC_URL_2 &&
      process.env.RPC_URL_2.length &&
      (hour >= 12 || day == 6 || day == 0)
    ) {
      if (!alter) {
        console.log(`Alter to ${process.env.RPC_URL_2} at ${new Date()}`);
        web3.setProvider(
          new Web3.providers.HttpProvider(process.env.RPC_URL_2),
        );
        alter = true;
        switched = true;
      }
    } else {
      if (alter) {
        console.log(`Alter to ${process.env.RPC_URL} at ${new Date()}`);
        web3.setProvider(new Web3.providers.HttpProvider(process.env.RPC_URL));
        alter = false;
        switched = true;
      }
    }
    if (switched) {
      eventContract = new web3.eth.Contract(
        eventABI as AbiItem[],
        process.env.EVENT_PROXY,
      );
      predictionContract = new web3.eth.Contract(
        predictionABI as AbiItem[],
        process.env.PREDICTION_PROXY,
      );
      switched = false;
    }

    const to = Math.min(cursor + STEP_BLOCK, await web3.eth.getBlockNumber());
    const params = { fromBlock: cursor + 1, toBlock: to };
    const eventsBatch = [];
    for (let idx = 0; idx < contracts.length; ++idx) {
      const contract = contracts[idx] ? eventContract : predictionContract;
      eventsBatch.push(await contract.getPastEvents(eventNames[idx], params));
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
    await sleep(BLOCK_TIME);
  }
}
