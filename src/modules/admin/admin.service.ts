// eslint-disable-next-line
const Web3 = require('web3');
import { Injectable, OnModuleInit } from '@nestjs/common';
import BigNumber from 'bignumber.js';
import { TxData } from 'ethereumjs-tx';
import { KMSSigner } from 'helpers/kms';
import { EventsService } from '../events/events.service';
import { UsersService } from '../users/users.service';
BigNumber.config({ EXPONENTIAL_AT: 100 });

@Injectable()
export class AdminService implements OnModuleInit {
  private web3;
  private eventContract;
  private erc721Contract;
  private signer: KMSSigner;

  constructor(
    private eventService: EventsService,
    private userService: UsersService,
  ) {
    this.web3 = new Web3();
    this.web3.setProvider(new Web3.providers.HttpProvider(process.env.RPC_URL));
    if (process.env.KMS_ID && process.env.KMS_ID.length) {
      this.signer = new KMSSigner(process.env.KMS_ID, process.env.RPC_URL);
    }
  }

  async onModuleInit() {
    if (process.env.KMS_ID && process.env.KMS_ID.length) {
      await this.signer.setMetadata();
    }
    (async () => {
      const { eventABI } = await import(
        `../../shares/contracts/abi/${process.env.APP_ENV}/eventABI`
      );
      const { erc721TokenABI } = await import(
        `../../shares/contracts/abi/${process.env.APP_ENV}/erc721TokenABI`
      );

      this.eventContract = new this.web3.eth.Contract(
        eventABI,
        process.env.EVENT_PROXY,
      );
      this.erc721Contract = new this.web3.eth.Contract(
        erc721TokenABI,
        process.env.ERC721_TOKEN_PROXY,
      );
    })();
  }
  async blockEvent(id: number): Promise<void> {
    const encodeAbi = await this.eventContract.methods
      .blockEvent(id)
      .encodeABI();

    // The payload we want to sign with the private
    const payload: TxData = {
      gasPrice: Number(await this.web3.eth.getGasPrice()),
      gasLimit: 160000,
      to: process.env.EVENT_PROXY,
      data: encodeAbi,
    };
    await this.signer.sendPayload(payload);
    await this.eventService.update(id, {
      isBlock: true,
      claimTime: new Date(),
    });
  }

  async unblockEvent(id: number): Promise<void> {
    const encodeAbi = await this.eventContract.methods
      .unblockEvent(id)
      .encodeABI();

    // The payload we want to sign with the private
    const payload: TxData = {
      gasPrice: Number(await this.web3.eth.getGasPrice()),
      gasLimit: 160000,
      to: process.env.EVENT_PROXY,
      data: encodeAbi,
    };
    await this.signer.sendPayload(payload);
    await this.eventService.update(id, {
      isBlock: false,
      claimTime: new Date(),
    });
  }

  async whitelistUser(addresses: string[]): Promise<void> {
    const encodeAbi = await this.erc721Contract.methods
      .whitelistUser(addresses)
      .encodeABI();

    // The payload we want to sign with the private
    const payload: TxData = {
      gasPrice: Number(await this.web3.eth.getGasPrice()),
      gasLimit: 160000,
      to: process.env.ERC721_TOKEN_PROXY,
      data: encodeAbi,
    };
    await this.signer.sendPayload(payload);
    await this.userService.whitelistUser(addresses);
  }

  async removeWhitelistUser(addresses: string[]): Promise<void> {
    const encodeAbi = await this.erc721Contract.methods
      .removeWhitelistUser(addresses)
      .encodeABI();

    // The payload we want to sign with the private
    const payload: TxData = {
      gasPrice: Number(await this.web3.eth.getGasPrice()),
      gasLimit: 160000,
      to: process.env.ERC721_TOKEN_PROXY,
      data: encodeAbi,
    };
    await this.signer.sendPayload(payload);
    await this.userService.removeWhitelistUser(addresses);
  }

  async setTime(startTime: number, endTime: number): Promise<void> {
    const encodeAbi = await this.erc721Contract.methods
      .setTime(startTime, endTime)
      .encodeABI();

    // The payload we want to sign with the private
    const payload: TxData = {
      gasPrice: Number(await this.web3.eth.getGasPrice()),
      gasLimit: 160000,
      to: process.env.ERC721_TOKEN_PROXY,
      data: encodeAbi,
    };
    await this.signer.sendPayload(payload);
  }
}
