import { JsonRpcProvider } from '@ethersproject/providers';
import { ETH_ENDPOINT, ETH_PRIVATE_KEY } from '../../config';
import { Wallet } from 'ethers';

export const getEthSigner = () => {
  const provider = new JsonRpcProvider(ETH_ENDPOINT);
  return new Wallet(ETH_PRIVATE_KEY).connect(provider);
};
