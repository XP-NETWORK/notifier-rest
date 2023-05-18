import axios from 'axios';
import { sc_verify } from '../config';

export type TGetNoWhitelistMappingRes = {
  status: string;
  code: number;
  data: {
    contractAddress: string;
    collectionAddress: string;
    chainNonce: number;
    status?: string;
    message?: string;
  };
};

export const getNoWhitelistMapping = async (
  collectionAddress: string,
  chainNonce: number
): Promise<TGetNoWhitelistMappingRes | undefined> => {
  console.log('getNoWhitelistMapping - START');

  try {
    const response = await axios.get<TGetNoWhitelistMappingRes>(
      `${sc_verify}/no-whitelist/${collectionAddress}/${chainNonce}`
    );
    console.log('getNoWhitelistMapping - response.data', response.data);

    return response.data;
  } catch (error) {
    console.log('error', error);
  }

  return undefined;
};

export const isSuccessNoWhitelistRes = (
  response?: TGetNoWhitelistMappingRes
) => {
  const res =
    response &&
    response?.data?.contractAddress &&
    response?.code === 200 &&
    response?.data?.status === 'SUCCESS';
  console.log('isSuccessNoWhitelistRes - condition', response);
  return res;
};
