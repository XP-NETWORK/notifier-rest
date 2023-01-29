import axios from 'axios';

/**
 * function keys to ignore eg : `toString` function if exists in solidity code
 */
const keysToNotCheck = ['toString'];
/**
 * Add function body without spaces here which we want to allow
 * Empty string is to ignore interface
 */
const checkFunctionsAndDefinitioins = {
  msgSender: [''],
  _msgSender: ['{returnContextMixin.msgSender();}', '{returnmsg.sender;}'],
  _exists: [
    '{return_ownerOf(tokenId)!=address(0);}',
    '{return_owners[tokenId]!=address(0);}',
  ],
  _ownerOf: ['{return_owners[tokenId];}'],
  ownerOf: [
    '{addressowner=_ownerOf(tokenId);require(owner!=address(0),"ERC721:invalidtokenID");returnowner;}',
    '{addressowner=_owners[tokenId];require(owner!=address(0),"ERC721:ownerqueryfornonexistenttoken");returnowner;}',
  ],
  _checkOnERC721Received: [''],
  safeTransferFrom: [
    '',
    '{require(from==_msgSender()||isApprovedForAll(from,_msgSender()),"ERC1155:callerisnotownernorapproved");_safeTransferFrom(from,to,id,amount,data);}',
    '{require(_isApprovedOrOwner(_msgSender(),tokenId),"ERC721:callerisnottokenownerorapproved");_safeTransfer(from,to,tokenId,data);}',
    '{require(_isApprovedOrOwner(_msgSender(),tokenId),"ERC721:transfercallerisnotownernorapproved");_safeTransfer(from,to,tokenId,_data);}',
  ],
  _isApprovedOrOwner: [
    '',
    '{addressowner=ERC721.ownerOf(tokenId);return(spender==owner||isApprovedForAll(owner,spender)||getApproved(tokenId)==spender);}',
    '{require(_exists(tokenId),"ERC721:operatorqueryfornonexistenttoken");addressowner=ERC721.ownerOf(tokenId);return(spender==owner||getApproved(tokenId)==spender||ERC721.isApprovedForAll(owner,spender));}',
  ],
  isApprovedForAll: [
    '',
    '{if(_isProxyForUser(_owner,_operator)){returntrue;}returnsuper.isApprovedForAll(_owner,_operator);}',
    '{return_operatorApprovals[account][operator];}',
    '{return_operatorApprovals[owner][operator];}',
  ],
  getApproved: [
    '',
    '{_requireMinted(tokenId);return_tokenApprovals[tokenId];}',
    '{require(_exists(tokenId),"ERC721:approvedqueryfornonexistenttoken");return_tokenApprovals[tokenId];}',
  ],
  _requireMinted: ['{require(_exists(tokenId),"ERC721:invalidtokenID");}'],
  _safeTransfer: [
    '',
    '{_transfer(from,to,tokenId);require(_checkOnERC721Received(from,to,tokenId,data),"ERC721:transfertononERC721Receiverimplementer");}',
    '{_transfer(from,to,tokenId);require(_checkOnERC721Received(from,to,tokenId,_data),"ERC721:transfertononERC721Receiverimplementer");}',
  ],
  _transfer: [
    '',
    '{require(ERC721.ownerOf(tokenId)==from,"ERC721:transferoftokenthatisnotown");require(to!=address(0),"ERC721:transfertothezeroaddress");_beforeTokenTransfer(from,to,tokenId);_approve(address(0),tokenId);_balances[from]-=1;_balances[to]+=1;_owners[tokenId]=to;emitTransfer(from,to,tokenId);}',
  ],
  _beforeTokenTransfer: [
    '',
    '{super._beforeTokenTransfer(operator,from,to,ids,amounts,data);require(!paused(),"ERC1155Pausable:tokentransferwhilepaused");}',
    '{}',
  ],
  _afterTokenTransfer: ['', '{}'],
};

function extractFunctions(str: string) {
  let functions: string[] = [];
  let stack: string[] = [];
  let start = false;

  for (let i = 0; i < str.length; i++) {
    if (str.substring(i, i + 9) === 'function ') {
      start = true;
    }

    if (start) {
      let semiColonIndex = str.indexOf(';', i);
      let forwardBracesIndex = str.indexOf('{', i);

      if (semiColonIndex !== -1 && semiColonIndex < forwardBracesIndex) {
        if (i < semiColonIndex) i = semiColonIndex + 1;
        console.log('Interface found', i, semiColonIndex, forwardBracesIndex);
        start = false;
        continue;
      }

      let myFunc = '';
      do {
        if (str[i] == '{') {
          stack.push('str');
        } else if (str[i] == '}') {
          stack.pop();
        }
        myFunc = myFunc.concat(str[i]);
        i++;
      } while (stack.length || i <= forwardBracesIndex);
      functions.push(myFunc);
      start = false;
    }
  }

  return functions;
}

/**
 * Function to extract body of function
 * @param str function that we want to extract body of
 * @returns function body
 */
function extractFunctionBody(str: string) {
  let stack = [];
  let start = -1;
  let end = -1;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '{') {
      if (stack.length === 0) {
        start = i;
      }
      //   @ts-ignore
      stack.push(str[i]);
    } else if (str[i] === '}') {
      stack.pop();
      if (stack.length === 0) {
        end = i;
        break;
      }
    }
  }
  return str.slice(start, end + 1);
}

/**
 * Function to check if contract is whitelistable or not
 * @param explorerApi explorer api to use for
 * @param contractAddress the contract address to check
 * @param apiKey api key of explorer api
 * @returns A boolean, true if all test cases passes false if none pass
 */

export const isWhitelistable = async (
  explorerApi: string,
  contractAddress: string,
  apiKey: string
) => {
  const data = await axios.get(
    `${explorerApi}/api?module=contract&action=getsourcecode&address=${contractAddress}&apikey=${apiKey}`
  );

  /**
   * If not verified return false
   */

  if (data.status !== 200) return false;

  const doubleSlashCommentsRegex = /\/\/.*?(\\n)/g;
  const nextLineRegex = /\n/g;
  const nextLineWithDoubleSlashRegex = /\\n/g;
  const tabRgex = /\r/g;
  const escapeSlashRegex = /\\"/g;
  const blockCommentsRegex = /\/\*[\s\S]*?\*\//g;
  const functionNamesRegex = /(function|constructor)\s+(\w+)\s*\(/;
  const spaceRegex = /\s/g;

  let sourceCode = data.data.result[0].SourceCode;
  let contractName = data.data.result[0].ContractName;
  console.log('Contract Name = ', contractName);
  if (!sourceCode.trim()) {
    return false;
  }
  sourceCode = sourceCode
    .replace(doubleSlashCommentsRegex, '')
    .replace(blockCommentsRegex, '')
    .replace(nextLineRegex, '')
    .replace(escapeSlashRegex, '"')
    .replace(tabRgex, '')
    .replace(nextLineWithDoubleSlashRegex, '');

  /**
   * if is upgradeable, return false
   */

  if (sourceCode.includes('Upgradeable')) return false;

  const matches = extractFunctions(sourceCode);

  console.log(matches);

  let functions: Record<string, string> = {};

  if (matches) {
    matches.forEach((match: string) => {
      console.log({ match });

      const funcName = match.match(functionNamesRegex)![2];
      const funcBody = extractFunctionBody(match).replace(spaceRegex, '');
      functions[funcName] = funcBody;
    });
  }

  let isVerified = true;

  for (let [functionName, functionBody] of Object.entries(functions)) {
    if (functionName == 'msgSender')
      console.log('asd', functionBody, functionName);
    if (
      //@ts-ignore
      checkFunctionsAndDefinitioins[functionName] &&
      !keysToNotCheck.includes(functionName)
    ) {
      console.log(functionName, functionBody);
      if (
        //@ts-ignore
        checkFunctionsAndDefinitioins[functionName].indexOf(functionBody) == -1
      ) {
        isVerified = false;
        break;
      }
    }
  }

  return isVerified;
};
