import { readFileSync, writeFileSync } from 'fs';
import axios from 'axios';
import { environment } from '../config';

const keysToNotCheck = ['toString'];
function logArrayItems(array) {
  array.forEach((item) => {
    const key = Object.keys(item)[0];
    const value = item[key];
    console.log(`${key}: ['${value}'],`);
    checkFunctionsAndDefinitioins[key] = `['${value}'],`;
  });
}
const addItems = async (array) => {
  array.map((item: any) => {
    const key = Object.keys(item)[0];
    const value = item[key];
    console.log({ key, value });
    checkFunctionsAndDefinitioins[key].push(value);
  });
};

const jsonContent = readFileSync('src/utils/source.json', 'utf-8');
const checkFunctionsAndDefinitioins = JSON.parse(jsonContent);

function extractFunctions(str: string) {
  const functions: string[] = [];
  const stack: string[] = [];
  let start = false;

  for (let i = 0; i < str.length; i++) {
    if (str.substring(i, i + 9) === 'function ') {
      start = true;
    }

    if (start) {
      const semiColonIndex = str.indexOf(';', i);
      const forwardBracesIndex = str.indexOf('{', i);

      if (semiColonIndex !== -1 && semiColonIndex < forwardBracesIndex) {
        if (i < semiColonIndex) i = semiColonIndex + 1;
        // console.log('Interface found', i, semiColonIndex, forwardBracesIndex);
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
  const stack = [];
  let start = -1;
  let end = -1;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '{') {
      if (stack.length === 0) {
        start = i;
      }
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
  let isVerified: {
    success: boolean;
    reason?: string;
  } = { success: true };
  const data = await axios.get(
    `${explorerApi}/api?module=contract&action=getsourcecode&address=${contractAddress}&apikey=${apiKey}`
  );

  /**
   * If not verified return false
   */

  if (data.status !== 200) {
    isVerified = { success: false, reason: 'Contract not found' };
    return isVerified;
  }

  const doubleSlashCommentsRegex = /\/\/.*?(\\n)/g;
  const doubleSlashCommentsRegexForNextLine = /\/\/.*$/gm;
  const nextLineRegex = /\n/g;
  const nextLineWithDoubleSlashRegex = /\\n/g;
  const tabRgex = /\r/g;
  const tabRgex_ = /\t/g;
  const escapeSlashRegex = /\\"/g;
  const blockCommentsRegex = /\/\*[\s\S]*?\*\//g;
  const functionNamesRegex = /(function|constructor)\s+(\w+)\s*\(/;
  const requireErrorString = /(\brequire[(][^,]*,[(...)]*)[^)]+(\))/g;
  const spaceRegex = /\s/g;

  let sourceCode = data.data.result[0].SourceCode;
  const contractName = data.data.result[0].ContractName;
  console.log('Contract Name = ', contractName);
  if (sourceCode === '') {
    isVerified = { success: false, reason: 'Contract not verified' };
    return isVerified;
  }
  sourceCode = sourceCode
    .replace(doubleSlashCommentsRegex, '')
    .replace(doubleSlashCommentsRegexForNextLine, '')
    .replace(blockCommentsRegex, '')
    .replace(nextLineRegex, '')
    .replace(requireErrorString, '$1""$2')
    .replace(escapeSlashRegex, '"')
    .replace(tabRgex, '')
    .replace(tabRgex_, '')
    .replace(nextLineWithDoubleSlashRegex, '');

  const matches = extractFunctions(sourceCode);

  const functions: Record<string, string> = {};

  if (matches) {
    matches.forEach((match: string) => {
      const funcName = match.match(functionNamesRegex)[2];
      const funcBody = extractFunctionBody(match).replace(spaceRegex, '');
      functions[funcName] = funcBody;
    });
  }

  const notAllowedFunctions = [];
  const notFoundFunctions = [];
  for (const [functionName, functionBody] of Object.entries(functions)) {
    if (!checkFunctionsAndDefinitioins[functionName]) {
      // and with all not allowed funtions in test
      if (environment === 'PRODUCTION') {
        notAllowedFunctions.push(functionName);
      } else {
        notAllowedFunctions.push({ [functionName]: functionBody });
      }
    } else if (!keysToNotCheck.includes(functionName)) {
      if (
        checkFunctionsAndDefinitioins[functionName].indexOf(functionBody) == -1
      ) {
        notFoundFunctions.push({ [functionName]: functionBody });
        // and with all not allowed funtions in test
        if (environment === '263+') break;
      }
    }
  }
  logArrayItems(notAllowedFunctions);
  addItems(notFoundFunctions);

  const updatedJson = JSON.stringify(checkFunctionsAndDefinitioins, null, 2);
  writeFileSync('src/utils/source.json', updatedJson, 'utf-8');
  return isVerified;
};
