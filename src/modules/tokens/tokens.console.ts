import { Command, Console } from 'nestjs-console';
import { Injectable } from '@nestjs/common';
import { TokensService } from './tokens.service';

@Console()
@Injectable()
export class TokenConsole {
  constructor(private readonly tokensService: TokensService) {}

  @Command({
    command: 'seed-tokens-data',
  })
  async seedTokensData(): Promise<void> {
    await this.tokensService.create({
      name: 'BNB',
      url: 'https://www.binance.com/en/buy-bnb',
    });
    await this.tokensService.create({
      name: 'LINK',
      url: 'https://pancakeswap.finance/swap?outputCurrency=0xf8a0bf9cf54bb92f17374d9e9a321e6a111a51bd',
    });
    await this.tokensService.create({
      name: 'EFUN',
      url: 'https://pancakeswap.finance/swap?outputCurrency=0x6746e37a756da9e34f0bbf1c0495784ba33b79b4',
    });
  }
}
