import { ethers } from 'ethers';

type TProvider =
  | ethers.providers.JsonRpcProvider
  | ethers.providers.Provider
  | ethers.Signer;

export async function hasEip1559(provider: TProvider): Promise<boolean> {
  const feeData = await provider.getFeeData();
  console.log(feeData);
  const { maxPriorityFeePerGas, maxFeePerGas } = feeData;
  if (maxPriorityFeePerGas !== null || maxFeePerGas !== null) return true;
  return false;
}
