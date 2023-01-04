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

const allowedFunctionsRepetead = [
  'safeTransferFrom(from,to,tokenId,"");',
  'asd(from,to,tokenId,"");',
];

export const isWhitelistable = async (
  explorerApi: string,
  contractAddress: string,
  apiKey: string
) => {
  if (!explorerApi || !contractAddress || !apiKey) return false;

  const endpoint = `${explorerApi}/api?module=contract&action=getsourcecode&address=${contractAddress}&apikey=${apiKey}`;
  console.log({ endpoint });

  try {
    const data = await axios.get(endpoint);
    // if(data.status !== 200) return false;
    let isNotVerified = false;

    let sourceCode = data.data.result[0].SourceCode;
    let contractName = data.data.result[0].ContractName;
    console.log('Contract Name = ', contractName);

    if (sourceCode === '') {
      console.log(isNotVerified);
      return isNotVerified;
    }

    let sources: any;
    let functions: string[] = [];
    let fileCodes: string[] = [];

    if (sourceCode.substring(0, 2) === '{{') {
      sourceCode = sourceCode.slice(1, sourceCode.length - 1);
      sources = JSON.parse(sourceCode).sources;

      Object.keys(sources).forEach((key) => {
        if (!key.includes('@openzeppelin')) {
          let func = sources[key].content.split('function ');

          fileCodes.push(
            sources[key].content
              .replaceAll(/(\r\n|\n|\r)/gm, '')
              .replaceAll(' ', '')
          );

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
    } else {
      sources = sourceCode;
      let fromIndex = sources.indexOf(`contract ${contractName}`);
      let mainContractFile = sources.substring(fromIndex);

      let isIndex = mainContractFile.indexOf('is') + 2;
      let leftCurlyBracketIndex = mainContractFile.indexOf('{');
      let checkInheritance = mainContractFile
        .substring(isIndex, leftCurlyBracketIndex)
        .replaceAll(' ', '')
        .split(',');

      console.log('Inheritance: ', checkInheritance);

      if (checkInheritance.indexOf('ERC721Upgradeable') > -1)
        return isNotVerified;

      let func = mainContractFile.split('function ');
      fileCodes.push(
        mainContractFile.replaceAll(/(\r\n|\n|\r)/gm, '').replaceAll(' ', '')
      );
      func.forEach((e: string, index: number) => {
        if (index > 0) {
          let str = e.replace(/\n/g, '');
          str = str.slice(0, str.indexOf('{'));
          functions.push(str);
        }
      });
    }
    let isSafeTransfer = false;
    if (!isNotVerified) {
      functions.forEach((func: any) => {
        if (func.includes('safeTransferFrom')) {
          isSafeTransfer = true;
        }
        isNotVerified = func.match(new RegExp(checkFunctions.join('|'), 'g'))
          ? true
          : isNotVerified;
      });
    }

    console.log('first condition', isNotVerified);

    if (isNotVerified && isSafeTransfer) {
      fileCodes.forEach((code: any) => {
        for (const allow of allowedFunctionsRepetead) {
          isNotVerified = code.includes(allow) ? false : isNotVerified;
          if (!isNotVerified) {
            break;
          }
        }
      });
    }

    console.log(!isNotVerified);
    return !isNotVerified;
  } catch (ex) {
    console.log('ERROR', ex);
    return false;
  }
};
