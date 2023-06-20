import { BigNumber, ethers } from 'ethers';
import { ETH_NO_WHITELIST_UTILS } from '../../config';
import { sleep } from '../sleep';
import { UserStore1155ABI as abi1155 } from './userStore1155ABI';
import { UserStore1155ByteCode as bytecode1155 } from './userStore1155ByteCode';
import { UserStore721ABI as abi721 } from './userStore721ABI';
import { UserStore721ByteCode as bytecode721 } from './userStore721ByteCode';

export type TGas = {
  maxPriorityFeePerGas: BigNumber;
  maxFeePerGas: BigNumber;
  gasLimit: number;
};

type TDeployNoWhitelistEvmContract = (args: {
  signer: ethers.Signer;
  type: 721 | 1155;
}) => Promise<string | undefined>;

type TBaseArgs = [NoWhitelistUtils: string, Gas?: TGas];

const Code = {
  721: {
    abi: abi721,
    bytecode: bytecode721,
  },
  1155: {
    abi: abi1155,
    bytecode: bytecode1155,
  },
};

export const deployNoWhitelistEvmContract: TDeployNoWhitelistEvmContract =
  async ({ signer, type }) => {
    const contract = new ethers.ContractFactory(
      Code[type].abi,
      Code[type].bytecode,
      signer
    );
    console.log('deployNoWhitelistEvmContract', { contract });
    let deployedContract: ethers.Contract | undefined;

    try {
      const baseArgs: TBaseArgs = [ETH_NO_WHITELIST_UTILS];

      await sleep(5000);
      deployedContract = await contract.deploy(...baseArgs);
      await deployedContract?.deployTransaction?.wait();
      console.log('deployNoWhitelistEvmContract', deployedContract);
    } catch (error) {
      console.error(`deployNoWhitelistEvmContract - error`, error);
    }

    if (!deployedContract) return undefined;

    console.log(
      `deployNoWhitelistEvmContract - transaction`,
      deployedContract.deployTransaction
    );

    console.log(
      `deployNoWhitelistEvmContract - address`,
      deployedContract.address
    );

    return deployedContract.address;
  };
