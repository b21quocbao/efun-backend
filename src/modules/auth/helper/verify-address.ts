// eslint-disable-next-line
const Web3 = require('web3');

export class VerifyAddress {
  private static instance: VerifyAddress;
  private web3;

  private constructor() {
    this.web3 = new Web3();
  }

  public static async checkRecoverSameAddress(
    address: string,
    signature: string,
    message: string,
  ): Promise<boolean> {
    if (!VerifyAddress.instance) {
      VerifyAddress.instance = new VerifyAddress();
    }
    const recover = await VerifyAddress.instance.web3.eth.accounts.recover(
      message,
      signature,
    );
    const recoverConvert = Web3.utils.toChecksumAddress(recover);
    const addressConvert = Web3.utils.toChecksumAddress(address);

    return addressConvert === recoverConvert;
  }
}
