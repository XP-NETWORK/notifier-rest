import axios from 'axios';

const checkFunctions = [
  'safeTransferFrom',
  '_isApprovedOrOwner',
  'isApprovedForAll',
  'getApproved',
  '_requireMinted',
  '_safeTransfer',
  '_transfer',
  '_beforeTokenTransfer',
  '_afterTokenTransfer',
];

export const isWhitelistable = async (
  explorerApi: string,
  contractAddress: string,
  apiKey: string
) => {
  if (!explorerApi || !contractAddress || !apiKey) return false;

  const endpoint = `${explorerApi}/api?module=contract&action=getsourcecode&address=${contractAddress}&apikey=${apiKey}`;

  try {
    const data = await axios.get(endpoint);
    // if(data.status !== 200) return false;
    let isNotVerified = false;

    let sourceCode = data.data.result[0].SourceCode;
    if (sourceCode === '') {
      console.log('isNotVerified', isNotVerified);
      return isNotVerified;
    }

    sourceCode = sourceCode.slice(1, sourceCode.length - 1);

    const sources = JSON.parse(sourceCode).sources;
    const functions: string[] = [];

    Object.keys(sources).forEach((key) => {
      if (!key.includes('@openzeppelin')) {
        let func = sources[key].content.split('function ');
        func.forEach((e: string, index: number) => {
          if (index > 0) {
            let str = e.replace(/\n/g, '');
            str = str.slice(0, str.indexOf('{'));
            functions.push(str);
          }
        });
      } else {
        if (key.includes('ERC721Upgradeable.sol')) {
          isNotVerified = true;
        }
      }
    });

    if (!isNotVerified)
      functions.forEach((func: any) => {
        isNotVerified = func.match(new RegExp(checkFunctions.join('|'), 'g'))
          ? true
          : isNotVerified;
      });
    console.log(!isNotVerified);
    return !isNotVerified;
  } catch (ex) {
    return false;
  }
};
