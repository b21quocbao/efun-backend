import { Injectable } from '@nestjs/common';
import { Command, Console } from 'nestjs-console';
import { predictionABI } from 'src/shares/contracts/abi/predictionABI';
import { ContractEvent } from 'src/shares/contracts/constant';
import { crawlSmartcontractEvents } from 'src/shares/helpers/smartcontract';
import Web3 from 'web3';
import { LatestBlockService } from '../latest-block/latest-block.service';
import { TransactionsService } from '../transactions/transactions.service';
import { UsersService } from '../users/users.service';
import { RewardsService } from './rewards.service';
import { AbiItem } from 'web3-utils';

@Console()
@Injectable()
export class RewardConsole {
  private web3;

  constructor(
    private readonly rewardsService: RewardsService,
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
      const user = await this.usersService.findByAddress(
        event.returnValues.user,
      );
      const receipt = await web3.eth.getTransactionReceipt(
        event.transactionHash,
      );

      const transaction = await this.transactionsService.create({
        amount: event.returnValues.amount,
        contractAddress: event.address,
        gas: receipt?.gasUsed,
        walletAddress: receipt?.from,
        txId: event.transactionHash,
      });

      await this.rewardsService.create({
        eventId: event.returnValues.eventId,
        userId: user.id,
        transactionId: transaction.id,
        token: event.returnValues.token,
        amount: event.returnValues.amount,
      });
    };

    await crawlSmartcontractEvents(
      Number(statingBlock),
      this.web3,
      this.latestBlockService,
      contract,
      ContractEvent.RewardClaimed,
      eventHandler,
    );
  }
}
