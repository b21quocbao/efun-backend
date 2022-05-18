import { Injectable } from '@nestjs/common';
import { Command, Console } from 'nestjs-console';
import { predictionABI } from 'src/shares/contracts/abi/predictionABI';
import { ContractEvent } from 'src/shares/contracts/constant';
import { crawlSmartcontractEvents } from 'src/shares/helpers/smartcontract';
import Web3 from 'web3';
import { LatestBlockService } from '../latest-block/latest-block.service';
import { TransactionsService } from '../transactions/transactions.service';
import { UsersService } from '../users/users.service';
import { EventsService } from './events.service';
import { AbiItem } from 'web3-utils';

@Console()
@Injectable()
export class EventConsole {
  private web3;

  constructor(
    private readonly eventsService: EventsService,
    private readonly transactionsService: TransactionsService,
    private readonly usersService: UsersService,
    private readonly latestBlockService: LatestBlockService,
  ) {
    this.web3 = new Web3();
    this.web3.setProvider(new Web3.providers.HttpProvider(process.env.RPC_URL));
  }

  @Command({
    command: 'confirm-payments <statingBlock>',
  })
  async confirmPayments(statingBlock = 0): Promise<void> {
    const web3 = new Web3(process.env.RPC_URL);

    const contract = new web3.eth.Contract(
      predictionABI as AbiItem[],
      process.env.PREDICTION_PROXY,
    );
    const eventHandler = async (event): Promise<void> => {
      console.log(`Processing event ${JSON.stringify(event.returnValues)}`);
      console.log(`Handle item with id ${event.returnValues.itemId}`);
      console.log(event.returnValues, 'Line #54 events.console.ts');

      // const user = await this.usersService.findByAddress(
      //   event.returnValues.creator,
      // );
      // const receipt = await web3.eth.getTransactionReceipt(
      //   event.transactionHash,
      // );

      // const transaction = await this.transactionsService.create({
      //   contractAddress: event.address,
      //   gas: receipt?.gasUsed,
      //   walletAddress: receipt?.from,
      //   txId: event.transactionHash,
      // });

      // await this.eventsService.update(event.returnValues.eventId, {
      //   startTime: event.returnValues.startTime,
      //   deadline: event.returnValues.deadlineTime,
      //   endTime: event.returnValues.endTime,
      //   userId: user.id,
      //   // helperAddress: event.returnValues.helperAddress,
      // });
    };

    await crawlSmartcontractEvents(
      Number(statingBlock),
      this.web3,
      this.latestBlockService,
      contract,
      ContractEvent.EventCreated,
      eventHandler,
    );
  }
}
