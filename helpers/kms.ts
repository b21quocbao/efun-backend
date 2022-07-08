import { keccak256 } from 'js-sha3';
import * as ethutil from 'ethereumjs-util';
import Web3 from 'web3';
import BN from 'bn.js';
import { Transaction, TxData } from 'ethereumjs-tx';
import {
  GetPublicKeyCommand,
  KMSClient,
  SignCommand,
  SignRequest,
} from '@aws-sdk/client-kms';
import Common from 'ethereumjs-common';
// eslint-disable-next-line
const asn1 = require('asn1.js');

export class KMSSigner {
  kms: KMSClient;
  web3: Web3;
  keyId: string;
  EcdsaSigAsnParse: any;
  EcdsaPubKey: any;
  pubKey: any;
  ethAddr: any;
  sig: any;
  recoveredPubAddr: any;
  constructor(key_id: string, providerURL: string) {
    this.kms = new KMSClient({});

    this.web3 = new Web3(new Web3.providers.HttpProvider(providerURL));
    this.keyId = key_id;

    this.EcdsaSigAsnParse = asn1.define('EcdsaSig', function (this: any) {
      // parsing this according to https://tools.ietf.org/html/rfc3279#section-2.2.3
      this.seq().obj(this.key('r').int(), this.key('s').int());
    });

    this.EcdsaPubKey = asn1.define('EcdsaPubKey', function (this: any) {
      // parsing this according to https://tools.ietf.org/html/rfc5480#section-2
      this.seq().obj(
        this.key('algo')
          .seq()
          .obj(this.key('a').objid(), this.key('b').objid()),
        this.key('pubKey').bitstr(),
      );
    });
  }

  sign = async (msgHash: Buffer, keyId: string) => {
    const params: SignRequest = {
      // key id or 'Alias/<alias>'
      KeyId: keyId,
      Message: new Uint8Array(msgHash),
      // 'ECDSA_SHA_256' is the one compatible with ECC_SECG_P256K1.
      SigningAlgorithm: 'ECDSA_SHA_256',
      MessageType: 'DIGEST',
    };
    const res = await this.kms.send(new SignCommand(params));
    return res;
  };

  getPublicKey = async (keyPairId: string) => {
    return this.kms.send(new GetPublicKeyCommand({ KeyId: keyPairId }));
  };

  getEthereumAddress = (publicKey: Buffer): string => {
    // The public key is ASN1 encoded in a format according to
    // https://tools.ietf.org/html/rfc5480#section-2
    // I used https://lapo.it/asn1js to figure out how to parse this
    // and defined the schema in the EcdsaPubKey object
    const res = this.EcdsaPubKey.decode(publicKey, 'der');
    let pubKeyBuffer: Buffer = res.pubKey.data;

    // The public key starts with a 0x04 prefix that needs to be removed
    // more info: https://www.oreilly.com/library/view/mastering-ethereum/9781491971932/ch04.html
    pubKeyBuffer = pubKeyBuffer.slice(1, pubKeyBuffer.length);

    const address = keccak256(pubKeyBuffer); // keccak256 hash of publicKey
    const buf2 = Buffer.from(address, 'hex');
    const EthAddr = '0x' + buf2.slice(-20).toString('hex'); // take last 20 bytes as ethereum adress
    return EthAddr;
  };

  findEthereumSig = async (plaintext: Buffer) => {
    //Get the signature from kms
    const signature = await this.sign(plaintext, this.keyId);
    if (signature.Signature == undefined) {
      throw new Error('Signature is undefined.');
    }

    const decoded = this.EcdsaSigAsnParse.decode(
      Buffer.from(signature.Signature),
      'der',
    );
    const r: BN = decoded.r;
    let s: BN = decoded.s;

    const secp256k1N = new BN(
      'fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141',
      16,
    ); // max value on the curve
    const secp256k1halfN = secp256k1N.div(new BN(2)); // half of the curve
    // Because of EIP-2 not all elliptic curve signatures are accepted
    // the value of s needs to be SMALLER than half of the curve
    // i.e. we need to flip s if it's greater than half of the curve
    if (s.gt(secp256k1halfN)) {
      // According to EIP2 https://github.com/ethereum/EIPs/blob/master/EIPS/eip-2.md
      // if s < half the curve we need to invert it
      // s = curve.n - s
      s = secp256k1N.sub(s);
      return { r, s };
    }
    // if s is less than half of the curve, we're on the "good" side of the curve, we can just return
    return { r, s };
  };

  recoverPubKeyFromSig = (msg: Buffer, r: BN, s: BN, v: number) => {
    const rBuffer = r.toBuffer();
    const sBuffer = s.toBuffer();
    const pubKey = ethutil.ecrecover(msg, (v & 1) + 27, rBuffer, sBuffer);
    const addrBuf = ethutil.pubToAddress(pubKey);
    const RecoveredEthAddr = ethutil.bufferToHex(addrBuf);
    return RecoveredEthAddr;
  };

  findRightKey = (msg: Buffer, r: BN, s: BN, expectedEthAddr: string) => {
    const v_lower = 97 * 2 + 35;
    const v_range = [v_lower, v_lower + 1];

    for (const v of v_range) {
      const pubKey = this.recoverPubKeyFromSig(msg, r, s, v);
      if (pubKey.toLowerCase() == expectedEthAddr.toLowerCase()) {
        return { pubKey, v: v_lower == v ? v_lower + 1 : v_lower };
      }
    }

    throw new Error('Invalid');
  };
  setMetadata = async () => {
    //Returns a DER encoded public key from amazon KMS directly
    this.pubKey = await this.getPublicKey(this.keyId);
    //Calculate the ethereum address from the DER public key
    this.ethAddr = this.getEthereumAddress(Buffer.from(this.pubKey.PublicKey));
    // Hash of the public key
    const ethAddrHash = ethutil.keccak(Buffer.from(this.ethAddr));
    // Get the signature value by SIGNING the ethaddrhash. This is the first time we are signing. We merely want the r and s
    // Asks KMS to sign the payload
    // KMS returns DER encoded signature
    // Decompress and calculate r and s
    // Invert if s is larger than the half of secp256k1
    // We get the finalized script
    this.sig = await this.findEthereumSig(ethAddrHash);
    //Try to recover ethereum address given the signature, and we choose if its 27 or 28 from the r and s
    this.recoveredPubAddr = this.findRightKey(
      ethAddrHash,
      this.sig.r,
      this.sig.s,
      this.ethAddr,
    );
  };
  signPayload = async (payload: TxData) => {
    // The payload we want to sign
    // We put it with the dummy r,s,v so that we can serialized the FROM field
    const txParams: TxData = {
      nonce: payload.nonce
        ? payload.nonce
        : await this.web3.eth.getTransactionCount(this.ethAddr),
      ...payload,
      r: this.sig.r.toBuffer(),
      s: this.sig.s.toBuffer(),
      v: this.recoveredPubAddr.v,
    };
    const common = Common.forCustomChain(
      'mainnet',
      {
        name: 'Chain',
        networkId: await this.web3.eth.getChainId(),
        chainId: await this.web3.eth.getChainId(),
        url: (this.web3.currentProvider as any).host,
      },
      'istanbul',
    );

    const tx = new Transaction(txParams, {
      common: common,
    });
    const txHash = tx.hash(false);
    //We sign the payload that we want and this will create the correct r and s
    const correctSig = await this.findEthereumSig(txHash);
    const correctRecoveredPubAddr = this.findRightKey(
      txHash,
      correctSig.r,
      correctSig.s,
      this.ethAddr,
    );
    tx.r = correctSig.r.toBuffer();
    tx.s = correctSig.s.toBuffer();
    tx.v = new BN(correctRecoveredPubAddr.v).toBuffer();
    const serializedTx = tx.serialize().toString('hex');
    return '0x' + serializedTx;
  };

  sendPayload = async (payload: TxData) => {
    const signedString = await this.signPayload(payload);
    return this.web3.eth.sendSignedTransaction(signedString);
  };
}
