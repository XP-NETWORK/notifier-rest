import { ethers } from 'ethers';
import { NoWhitelistEVMBridgeABI as abi } from './bridgeABI';
import { ETH_NO_WHITELIST_UTILS } from '../../config';

export type TCheckIfMappingExistsInBridgeReturn =
  | {
      status: 'exists';
      address: string;
    }
  | {
      status: 'error';
    }
  | {
      status: 'does_not_exist';
    };

type TFunction = 'collectionToContract' | 'contractToCollection';

export const checkIfMappingExistsInBridge = async (
  signer: ethers.providers.JsonRpcProvider | ethers.Signer,
  address: string,
  fn: TFunction = 'collectionToContract'
): Promise<TCheckIfMappingExistsInBridgeReturn> => {
  console.log('checkIfMappingExistsInBridge', { ETH_NO_WHITELIST_UTILS });
  if (!ETH_NO_WHITELIST_UTILS) return { status: 'does_not_exist' };

  const bridge = new ethers.Contract(ETH_NO_WHITELIST_UTILS, abi, signer);
  console.log('checkIfMappingExistsInBridge', { bridge });

  try {
    const response: [string] = await bridge.functions[fn](address);
    console.log('checkIfMappingExistsInBridge', response);

    if (response[0] === ethers.constants.AddressZero)
      return { status: 'does_not_exist' };
    else return { address: response[0], status: 'exists' };
  } catch (error) {
    console.error('checkIfMappingExistsInBridge - error', error);
  }
  return { status: 'error' };
};
