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
  allowance: [
    '',
    '{}',
    '{return_allowances[owner][spender];}',
    '{returnallowances[_owner][_spender][_id];}',
  ],
  _contains: [
    '',
    '{}',
    '{returnset._indexes[value]!=0;}',
    '{returnmap._indexes[key]!=0;}',
  ],
  _verifyCallResult: [
    `{if(success){returnreturndata;}else{//Lookforrevertreasonandbubbleitupifpresentif(returndata.length>0){//Theeasiestwaytobubbletherevertreasonisusingmemoryviaassembly//solhint-disable-next-lineno-inline-assemblyassembly{letreturndata_size:=mload(returndata)revert(add(32,returndata),returndata_size)}}else{revert(errorMessage);}}}`,
    '{if(success){returnreturndata;}else{//Lookforrevertreasonandbubbleitupifpresentif(returndata.length>0){//Theeasiestwaytobubbletherevertreasonisusingmemoryviaassemblyassembly{letreturndata_size:=mload(returndata)revert(add(32,returndata),returndata_size)}}else{revert(errorMessage);}}}',
    '{if(success){returnreturndata;}else{if(returndata.length>0){assembly{letreturndata_size:=mload(returndata)revert(add(32,returndata),returndata_size)}}else{revert(errorMessage);}}}',
    '',
    `{if(success){returnreturndata;}else{if(returndata.length>0){assembly{letreturndata_size:=mload(returndata)revert(add(32,returndata),returndata_size)}}else{revert(errorMessage);}}}`,
    '{}',
  ],
  verifyCallResult: [
    '',
    '{if(success){returnreturndata;}else{if(returndata.length>0){assembly{letreturndata_size:=mload(returndata)revert(add(32,returndata),returndata_size)}}else{revert(errorMessage);}}}',
    '{if(success){returnreturndata;}else{_revert(returndata,errorMessage);}}',
    '{if(success){returnreturndata;}else{//Lookforrevertreasonandbubbleitupifpresentif(returndata.length>0){//Theeasiestwaytobubbletherevertreasonisusingmemoryviaassembly///@soliditymemory-safe-assemblyassembly{letreturndata_size:=mload(returndata)revert(add(32,returndata),returndata_size)}}else{revert(errorMessage);}}}',
    '{if(success){returnreturndata;}else{if(returndata.length>0){assembly{letreturndata_size:=mload(returndata)revert(add(32,returndata),returndata_size)}}else{revert(errorMessage);}}}',
    '{}',
    `{if(success){returnreturndata;}else{//Lookforrevertreasonandbubbleitupifpresentif(returndata.length>0){//Theeasiestwaytobubbletherevertreasonisusingmemoryviaassemblyassembly{letreturndata_size:=mload(returndata)revert(add(32,returndata),returndata_size)}}else{revert(errorMessage);}}}`,
  ],
  _remove: [
    '',
    '{}',
    '{uint256keyIndex=map._indexes[key];if(keyIndex!=0){uint256toDeleteIndex=keyIndex-1;uint256lastIndex=map._entries.length-1;MapEntrystoragelastEntry=map._entries[lastIndex];map._entries[toDeleteIndex]=lastEntry;map._indexes[lastEntry._key]=toDeleteIndex+1;map._entries.pop();deletemap._indexes[key];returntrue;}else{returnfalse;}}',
    '{uint256valueIndex=set._indexes[value];if(valueIndex!=0){uint256toDeleteIndex=valueIndex-1;uint256lastIndex=set._values.length-1;if(lastIndex!=toDeleteIndex){bytes32lastValue=set._values[lastIndex];set._values[toDeleteIndex]=lastValue;set._indexes[lastValue]=valueIndex;}set._values.pop();deleteset._indexes[value];returntrue;}else{returnfalse;}}',
    `{//Wereadandstorethekey'sindextopreventmultiplereadsfromthesamestorageslotuint256keyIndex=map._indexes[key];if(keyIndex!=0){//Equivalenttocontains(map,key)//Todeleteakey-valuepairfromthe_entriesarrayinO(1),weswaptheentrytodeletewiththelastone//inthearray,andthenremovethelastentry(sometimescalledas'swapandpop').//Thismodifiestheorderofthearray,asnotedin{at}.uint256toDeleteIndex=keyIndex-1;uint256lastIndex=map._entries.length-1;//Whentheentrytodeleteisthelastone,theswapoperationisunnecessary.However,sincethisoccurs//sorarely,westilldotheswapanywaytoavoidthegascostofaddingan'if'statement.MapEntrystoragelastEntry=map._entries[lastIndex];//Movethelastentrytotheindexwheretheentrytodeleteismap._entries[toDeleteIndex]=lastEntry;//Updatetheindexforthemovedentrymap._indexes[lastEntry._key]=toDeleteIndex+1;//Allindexesare1-based//Deletetheslotwherethemovedentrywasstoredmap._entries.pop();//Deletetheindexforthedeletedslotdeletemap._indexes[key];returntrue;}else{returnfalse;}}`,
    `{//Wereadandstorethevalue'sindextopreventmultiplereadsfromthesamestorageslotuint256valueIndex=set._indexes[value];if(valueIndex!=0){//Equivalenttocontains(set,value)//Todeleteanelementfromthe_valuesarrayinO(1),weswaptheelementtodeletewiththelastonein//thearray,andthenremovethelastelement(sometimescalledas'swapandpop').//Thismodifiestheorderofthearray,asnotedin{at}.uint256toDeleteIndex=valueIndex-1;uint256lastIndex=set._values.length-1;//Whenthevaluetodeleteisthelastone,theswapoperationisunnecessary.However,sincethisoccurs//sorarely,westilldotheswapanywaytoavoidthegascostofaddingan'if'statement.bytes32lastvalue=set._values[lastIndex];//Movethelastvaluetotheindexwherethevaluetodeleteisset._values[toDeleteIndex]=lastvalue;//Updatetheindexforthemovedvalueset._indexes[lastvalue]=toDeleteIndex+1;//Allindexesare1-based//Deletetheslotwherethemovedvaluewasstoredset._values.pop();//Deletetheindexforthedeletedslotdeleteset._indexes[value];returntrue;}else{returnfalse;}}`,
  ],
  isNonFungible: ['', '{}', '{return_id\\u0026TYPE_NF_BIT==TYPE_NF_BIT;}'],
  contains: [
    '',
    '{}',
    '{return_contains(set._inner,bytes32(value));}',
    '{return_contains(map._inner,bytes32(key));}',
  ],
  getNonFungibleBaseType: ['', '{}', '{return_id\\u0026TYPE_MASK;}'],
  _removeTokenFromAllTokensEnumeration: [
    `{//Topreventagapinthetokensarray,westorethelasttokenintheindexofthetokentodelete,and//thendeletethelastslot(swapandpop).uint256lastTokenIndex=_allTokens.length-1;uint256tokenIndex=_allTokensIndex[tokenId];//Whenthetokentodeleteisthelasttoken,theswapoperationisunnecessary.However,sincethisoccursso//rarely(whenthelastmintedtokenisburnt)thatwestilldotheswapheretoavoidthegascostofadding//an'if'statement(likein_removeTokenFromOwnerEnumeration)uint256lastTokenId=_allTokens[lastTokenIndex];_allTokens[tokenIndex]=lastTokenId;//Movethelasttokentotheslotoftheto-deletetoken_allTokensIndex[lastTokenId]=tokenIndex;//Updatethemovedtoken'sindex//Thisalsodeletesthecontentsatthelastpositionofthearraydelete_allTokensIndex[tokenId];_allTokens.pop();}`,
    '',
    '{}',
    '{uint256lastTokenIndex=_allTokens.length-1;uint256tokenIndex=_allTokensIndex[tokenId];uint256lastTokenId=_allTokens[lastTokenIndex];_allTokens[tokenIndex]=lastTokenId;_allTokensIndex[lastTokenId]=tokenIndex;delete_allTokensIndex[tokenId];_allTokens.pop();}',
  ],
  _addTokenToOwnerEnumeration: [
    '{_ownedTokensIndex[tokenId]=_ownedTokens[to].length;_ownedTokens[to].push(tokenId);}',
    '{}',
    '{uint256length=ERC721.balanceOf(to);_ownedTokens[to][length]=tokenId;_ownedTokensIndex[tokenId]=length;}',
  ],
  _approve: [
    '{addressowner=ownerOf(tokenId);if(approvalCheck&&_msgSenderERC721A()!=owner)if(!isApprovedForAll(owner,_msgSenderERC721A())){_revert(ApprovalCallerNotOwnerNorApproved.selector);}_tokenApprovals[tokenId].value=to;emitApproval(owner,to,tokenId);}',
    '{\\r_tokenApprovals[tokenId]=to;\\remitApproval(ERC721.ownerOf(tokenId),to,tokenId);\\r}',
    '{_tokenApprovals[tokenId]=to;emitApproval(owner,to,tokenId);}',
    '{_tokenApprovals[tokenId]=to;emitApproval(ownerOf(tokenId),to,tokenId);}',
    '{_tokenApprovals[tokenId]=to;emitApproval(ERC721.ownerOf(tokenId),to,tokenId);}',
    '{require(owner!=address(0),"ERC20:approvefromthezeroaddress");require(spender!=address(0),"ERC20:approvetothezeroaddress");_allowances[owner][spender]=amount;emitApproval(owner,spender,amount);}',
    '{_tokenApprovals[tokenId]=to;emitApproval(ERC721.ownerOf(tokenId),to,tokenId);//internalowner}',
  ],
  msgSender: [
    '{if(msg.sender==address(this)){bytesmemoryarray=msg.data;uint256index=msg.data.length;assembly{sender:=and(mload(add(array,index)),0xffffffffffffffffffffffffffffffffffffffff)}}else{sender=payable(msg.sender);}returnsender;}',
    '{assembly{sender:=shr(96,calldataload(sub(calldatasize(),20)))}}',
  ],
  _msgSender: [
    '{returnContextMixin.msgSender();}',
    '{returnmsg.sender;}',
    '{returnmsgSender();}',
    '{returnpayable(msg.sender);}',
    '{returnForwarderRegistryContextBase._msgSender();}',
    '{returnGameRegistryConsumer._msgSender();}',
  ],
  add: [
    '{}',
    '{c=a+b;require(c>=a);returnc;}',
    '{minters[_minter]=true;emitMinterRoleGranted(_minter);}',
    '{require(value<type(uint240).max,"Outofrange");uint256amountPos=BalanceAmount.unwrap(b);uint240amount=uint240(amountPos>>16);uint16position=uint16(amountPos&0xffff);amount+=uint240(value);amountPos=(uint256(amount)<<16)|position;returnBalanceAmount.wrap(amountPos);}',
    '',
    '{uintc=a+b;require(c>=a,"SafeMath:additionoverflow");returnc;}',
    '{c=a+b;assert(c\\u003e=a);returnc;}',
    '{returna+b;}',
    '{uint256c=a+b;require(c>=a,"SafeMath:additionoverflow");returnc;}',
    '{return_add(set._inner,bytes32(value));}',
    '{require(!has(role,account),"Roles:accountalreadyhasrole");role.bearer[account]=true;}',
  ],
  _exists: [
    '{return_ownerOf(tokenId)!=address(0);}',
    '{return_startTokenId()\\u003c=tokenId\\u0026\\u0026tokenId\\u003c_currentIndex\\u0026\\u0026_packedOwnerships[tokenId]\\u0026_BITMASK_BURNED==0;}',
    '{\\rreturn_owners[tokenId]!=address(0);\\r}',
    '{return_startTokenId()<=tokenId&&tokenId<currentIndex;}',
    '{return_owners[tokenId]!=address(0);}',
    '{addressowner=_tokenOwner[tokenId];returnowner!=address(0);}',
    '{return_startTokenId()<=tokenId&&tokenId<_currentIndex&&_packedOwnerships[tokenId]&_BITMASK_BURNED==0;}',
    '{returntokenId<_owners.length;}',
    '{return_startTokenId()<=tokenId&&tokenId<_currentIndex&&//Ifwithinbounds,_packedOwnerships[tokenId]&_BITMASK_BURNED==0;//andnotburned.}',
    '{return_startTokenId()<=tokenId&&tokenId<_currentIndex&&!_ownerships[tokenId].burned;}',
    '{returntokenId>0&&tokenId<=getNumMinted()&&_tokens[tokenId].owner!=0x0;}',
    '{return_tokenOwners.contains(tokenId);}',
    '{returntokenId<currentIndex;}',
  ],
  ownerOf: [
    '{addressowner=_tokenOwner[tokenId];require(owner!=address(0),"ERC721:ownerqueryfornonexistenttoken");returnowner;}',
    '{\\raddressowner=_owners[tokenId];\\rrequire(owner!=address(0),"ERC721:ownerqueryfornonexistenttoken");\\rreturnowner;\\r}',
    '{require(idToOwner[_tokenId]!=address(0));_owner=idToOwner[_tokenId];}',
    '{return_ownershipOf(tokenId).addr;}',
    '{returnownershipOf(tokenId).addr;}',
    '{return_ownerOf(tokenId)!=address(0);}',
    '{addressowner=_ownerOf(tokenId);require(owner!=address(0),"ERC721:invalidtokenID");returnowner;}',
    '{addressowner=_owners[tokenId];require(owner!=address(0),"ERC721:ownerqueryfornonexistenttoken");returnowner;}',
    '{require(_exists(tokenId),"ERC721:ownerqueryfornonexistenttoken");returnaddress(_tokens[tokenId].owner);}',
    '{addressowner=_owners[tokenId];require(owner!=address(0),"ERC721:invalidtokenID");returnowner;}',
    '{require(_exists(tokenId),"ERC721:ownerqueryfornonexistenttoken");returnaddress(_tokens[tokenId].owner);}',
    '{returnaddress(uint160(_packedOwnershipOf(tokenId)));}',
    '{require(expiries[tokenId]>now);returnsuper.ownerOf(tokenId);}',
    '{uint256owner=s.owners[tokenId];require(_tokenExists(owner),"ERC721:non-existingtoken");return_tokenOwner(owner);}',
    '{return_tokenOwners.get(tokenId,"ERC721:ownerqueryfornonexistenttoken");}',
    '{returnnfOwners[_id];}',
    '{if(!_exists(tokenId))revertOwnerQueryForNonexistentToken();//Cannotrealisticallyoverflow,sinceweareusinguint256unchecked{for(tokenId;;tokenId++){if(_owners[tokenId]!=address(0)){return_owners[tokenId];}}}revertUnableDetermineTokenOwner();}',
  ],
  _checkOnERC721Received: [
    '{\\rif(to.isContract()){\\rtryIERC721Receiver(to).onERC721Received(_msgSender(),from,tokenId,_data)returns(bytes4retval){\\rreturnretval==IERC721Receiver(to).onERC721Received.selector;\\r}catch(bytesmemoryreason){\\rif(reason.length==0){\\rrevert("ERC721:transfertononERC721Receiverimplementer");\\r}else{\\rassembly{\\rrevert(add(32,reason),mload(reason))\\r}\\r}\\r}\\r}else{\\rreturntrue;\\r}\\r}',
    '{if(to.isContract()){tryIERC721Receiver(to).onERC721Received(_msgSender(),from,tokenId,_data)returns(bytes4retval){returnretval==IERC721Receiver(to).onERC721Received.selector;}catch(bytesmemoryreason){if(reason.length==0){revert("ERC721A:transfertononERC721Receiverimplementer");}else{assembly{revert(add(32,reason),mload(reason))}}}}else{returntrue;}}',
    '{if(to.isContract()){tryIERC721Receiver(to).onERC721Received(_msgSender(),from,tokenId,data)returns(bytes4retval){returnretval==IERC721Receiver.onERC721Received.selector;}catch(bytesmemoryreason){if(reason.length==0){revert("ERC721:transfertononERC721Receiverimplementer");}else{///@soliditymemory-safe-assemblyassembly{revert(add(32,reason),mload(reason))}}}}else{returntrue;}}',
    '{if(to.isContract()){tryIERC721Receiver(to).onERC721Received(_msgSender(),from,tokenId,data)returns(bytes4retval){returnretval==IERC721Receiver.onERC721Received.selector;}catch(bytesmemoryreason){if(reason.length==0){revert("ERC721:transfertononERC721Receiverimplementer");}else{assembly{revert(add(32,reason),mload(reason))}}}}else{returntrue;}}',
    '{if(to.isContract()){tryIERC721Receiver(to).onERC721Received(_msgSender(),from,tokenId,_data)returns(bytes4retval){returnretval==IERC721Receiver.onERC721Received.selector;}catch(bytesmemoryreason){if(reason.length==0){revert("ERC721:transfertononERC721Receiverimplementer");}else{assembly{revert(add(32,reason),mload(reason))}}}}else{returntrue;}}',
    '{if(!to.isContract()){returntrue;}bytes4retval=IERC721Receiver(to).onERC721Received(msg.sender,from,tokenId,_data);return(retval==_ERC721_RECEIVED);}',
    '{if(to.code.length==0)returntrue;tryIERC721Receiver(to).onERC721Received(msg.sender,from,tokenId,_data)returns(bytes4retval){returnretval==IERC721Receiver(to).onERC721Received.selector;}catch(bytesmemoryreason){if(reason.length==0)revertTransferToNonERC721ReceiverImplementer();assembly{revert(add(32,reason),mload(reason))}}}',
    '{if(to.isContract()){tryIERC721Receiver(to).onERC721Received(_msgSender(),from,tokenId,_data)returns(bytes4retval){returnretval==IERC721Receiver.onERC721Received.selector;}catch(bytesmemoryreason){if(reason.length==0){revert("ERC721:transfertononERC721Receiverimplementer");}else{assembly{revert(add(32,reason),mload(reason))}}}}returntrue;}',
    '{if(to.isContract()){tryIERC721Receiver(to).onERC721Received(_msgSender(),from,tokenId,_data)returns(bytes4retval){returnretval==IERC721Receiver(to).onERC721Received.selector;}catch(bytesmemoryreason){if(reason.length==0){revert("ERC721:transfertononERC721Receiverimplementer");}else{//solhint-disable-next-lineno-inline-assemblyassembly{revert(add(32,reason),mload(reason))}}}}else{returntrue;}}',
    '{if(!to.isContract()){returntrue;}bytesmemoryreturndata=to.functionCall(abi.encodeWithSelector(IERC721Receiver(to).onERC721Received.selector,_msgSender(),from,tokenId,_data),"ERC721:transfertononERC721Receiverimplementer");bytes4retval=abi.decode(returndata,(bytes4));return(retval==_ERC721_RECEIVED);}',
    '{if(to.isContract()){tryIERC721Receiver(to).onERC721Received(_msgSender(),from,tokenId,_data)returns(bytes4retval){returnretval==IERC721Receiver(to).onERC721Received.selector;}catch(bytesmemoryreason){if(reason.length==0){revert("ERC721:transfertononERC721Receiverimplementer");}else{assembly{revert(add(32,reason),mload(reason))}}}}else{returntrue;}}',
  ],
  safeTransferFrom: [
    '',
    `{require(to!=address(this),"Recipientcannotbetheaddressofthecontract");super.safeTransferFrom(from,to,tokenId,_data);rentedTokensLandlords[tokenId]=address(0);}`,
    '{transferFrom(from,to,tokenId);require(_checkOnERC721Received(from,to,tokenId,_data),"ERC721:transfertononERC721Receiverimplementer");}',
    '{\\rsuper.safeTransferFrom(from,to,tokenId,data);\\r}',
    '{\\rrequire(_isApprovedOrOwner(_msgSender(),tokenId),"ERC721:transfercallerisnotownernorapproved");\\r_safeTransfer(from,to,tokenId,_data);\\r}',
    '{_safeTransferFrom(_from,_to,_tokenId,"");}',
    '{TokenOwnershipmemoryprevOwnership=ownershipOf(tokenId);boolisApprovedOrOwner=(_msgSender()==prevOwnership.addr||getApproved(tokenId)==_msgSender()||isApprovedForAll(prevOwnership.addr,_msgSender()));require(isApprovedOrOwner,"ERC721A:transfercallerisnotownernorapproved");require(prevOwnership.addr==from,"ERC721A:transferfromincorrectowner");require(to!=address(0),"ERC721A:transfertothezeroaddress");_beforeTokenTransfers(from,to,tokenId,1);//Clearapprovalsfromthepreviousowner_approve(address(0),tokenId,prevOwnership.addr);_addressData[from].balance-=1;_addressData[to].balance+=1;_ownerships[tokenId]=TokenOwnership(to,uint64(block.timestamp));//IftheownershipslotoftokenId+1isnotexplicitlyset,thatmeansthetransferinitiatorownsit.//SettheslotoftokenId+1explicitlyinstoragetomaintaincorrectnessforownerOf(tokenId+1)calls.uint256nextTokenId=tokenId+1;if(_ownerships[nextTokenId].addr==address(0)){if(_exists(nextTokenId)){_ownerships[nextTokenId]=TokenOwnership(prevOwnership.addr,prevOwnership.startTimestamp);}}emitTransfer(from,to,tokenId);_afterTokenTransfers(from,to,tokenId,1);}',
    '{super.safeTransferFrom(from,to,tokenId,data);}',
    '{_transfer(from,to,tokenId);require(_checkOnERC721Received(from,to,tokenId,_data),"ERC721A:transfertononERC721Receiverimplementer");}',
    '{\\rrequire(to!=address(0),"ERC1155:transfertothezeroaddress");\\rrequire(\\rfrom==_msgSender()||isApprovedForAll(from,_msgSender()),\\r"ERC1155:callerisnotownernorapproved"\\r);\\r\\raddressoperator=_msgSender();\\r\\ruint256fromBalance=_balances[id][from];\\rrequire(fromBalance>=amount,"ERC1155:insufficientbalancefortransfer");\\r_balances[id][from]=fromBalance-amount;\\r_balances[id][to]+=amount;\\r\\remitTransferSingle(operator,from,to,id,amount);\\r\\r_doSafeTransferAcceptanceCheck(operator,from,to,id,amount,data);\\r}',
    `{//bytes4(keccak256(bytes('transferFrom(address,address,uint256)')));(boolsuccess,bytesmemorydata)=token.call(abi.encodeWithSelector(0x23b872dd,from,to,value));require(success&&(data.length==0||abi.decode(data,(bool))),'Transferfailed');}`,
    '{_pushBurn(from,nftId,amount);_pushMint(to,nftId,amount);super.safeTransferFrom(from,to,nftId,amount,data);}',
    '{require((msg.sender==_from)||isApprovedForAll(_from,msg.sender),"INVALID_OPERATOR");require(_to!=address(0),"INVALID_RECIPIENT");if(_id>RING&&_id<=RING+ttlRings){_updateIDUserTotalBalance(_to,RING_INDEX,_amount,Operations.Add);_updateIDUserTotalBalance(_from,RING_INDEX,_amount,Operations.Sub);}if(_id>AMULET&&_id<=AMULET+ttlAmulets){_updateIDUserTotalBalance(_to,AMULET_INDEX,_amount,Operations.Add);_updateIDUserTotalBalance(_from,AMULET_INDEX,_amount,Operations.Sub);}if(_id>FIGHTER&&_id<=FIGHTER+ttlFYakuzas){_updateIDUserTotalBalance(_to,FIGHTER_INDEX,_amount,Operations.Add);//Addamounttorecipient_updateIDUserTotalBalance(_from,FIGHTER_INDEX,_amount,Operations.Sub);//Addamounttorecipient}if(_id>FIGHT_CLUB&&_id<=FIGHT_CLUB+ttlFightClubs){_updateIDUserTotalBalance(_to,FIGHT_CLUB_INDEX,_amount,Operations.Add);//Addamounttorecipient_updateIDUserTotalBalance(_from,FIGHT_CLUB_INDEX,_amount,Operations.Sub);//AddamounttorecipientidToForgeFightClub[_id].owner=_to;}if(_id>FORGE&&_id<=FORGE+ttlForges){_updateIDUserTotalBalance(_to,FORGE_INDEX,_amount,Operations.Add);//Addamounttorecipient_updateIDUserTotalBalance(_from,FORGE_INDEX,_amount,Operations.Sub);//AddamounttorecipientidToForgeFightClub[_id].owner=_to;}_safeTransferFrom(_from,_to,_id,_amount);_callonERC1155Received(_from,_to,_id,_amount,gasleft(),_data);}',
    '{super.safeTransferFrom(from,to,id,amount,data);}',
    '{//bytes4(keccak256(bytes(transferFrom(address,address,uint256))));(boolsuccess,bytesmemorydata)=token.call(abi.encodeWithSelector(0x23b872dd,from,to,value));require(success&&(data.length==0||abi.decode(data,(bool))),Transferfailed);}',
    `{//bytes4(keccak256(bytes("transferFrom(address,address,uint256)")));(boolsuccess,bytesmemorydata)=token.call(abi.encodeWithSelector(0x23b872dd,from,to,value));require(success&&(data.length==0||abi.decode(data,(bool))),"Transferfailed");}`,
    '{require(to!=address(0),"ERC1155:transfertothezeroaddress");require(from==_msgSender()||isApprovedForAll(from,_msgSender()),"ERC1155:callerisnotownernorapproved");addressoperator=_msgSender();_beforeTokenTransfer(operator,from,to,_asSingletonArray(id),_asSingletonArray(amount),data);_balances[id][from]=_balances[id][from].sub(amount,"ERC1155:insufficientbalancefortransfer");_balances[id][to]=_balances[id][to].add(amount);emitTransferSingle(operator,from,to,id,amount);_doSafeTransferAcceptanceCheck(operator,from,to,id,amount,data);}',
    '{require(to!=address(0),"ERC1155:transfertothezeroaddress");require(from==_msgSender()||isApprovedForAll(from,_msgSender()),"ERC1155:callerisnotownernorapproved");addressoperator=_msgSender();_beforeTokenTransfer(operator,from,to,_asSingletonArray(id),_asSingletonArray(amount),data);uint256fromBalance=_balances[id][from];require(fromBalance>=amount,"ERC1155:insufficientbalancefortransfer");_balances[id][from]=fromBalance-amount;_balances[id][to]+=amount;emitTransferSingle(operator,from,to,id,amount);_doSafeTransferAcceptanceCheck(operator,from,to,id,amount,data);}',
    '{\rrequire(to!=address(0),"ERC1155:transfertothezeroaddress");\rrequire(\rfrom==_msgSender()||isApprovedForAll(from,_msgSender()),\r"ERC1155:callerisnotownernorapproved"\r);\r\raddressoperator=_msgSender();\r\ruint256fromBalance=_balances[id][from];\rrequire(fromBalance>=amount,"ERC1155:insufficientbalancefortransfer");\r_balances[id][from]=fromBalance-amount;\r_balances[id][to]+=amount;\r\remitTransferSingle(operator,from,to,id,amount);\r\r_doSafeTransferAcceptanceCheck(operator,from,to,id,amount,data);\r}',
    '{\\rrequire(to!=address(0),"ERC1155:transfertothezeroaddress");\\rrequire(\\rfrom==_msgSender()||isApprovedForAll(from,_msgSender()),\\r"ERC1155:callerisnotownernorapproved"\\r);\\r\\raddressoperator=_msgSender();\\r\\ruint256fromBalance=_balances[id][from];\\rrequire(fromBalance>=amount,"ERC1155:insufficientbalancefortransfer");\\r_balances[id][from]=fromBalance-amount;\\r_balances[id][to]+=amount;\\r\\remitTransferSingle(operator,from,to,id,amount);\\r\\r_doSafeTransferAcceptanceCheck(operator,from,to,id,amount,data);\\r},',
    '{require(to!=address(0),"ERC1155:transfertothezeroaddress");addressoperator=_msgSender();_beforeTokenTransfer(operator,from,to,_asSingletonArray(id),_asSingletonArray(amount),data);uint256fromBalance=_balances[id][from];require(fromBalance>=amount,"ERC1155:insufficientbalancefortransfer");unchecked{_balances[id][from]=fromBalance-amount;}_balances[id][to]+=amount;emitTransferSingle(operator,from,to,id,amount);_doSafeTransferAcceptanceCheck(operator,from,to,id,amount,data);}',
    '{_transfer(from,to,tokenId);if(to.isContract()&&!_checkContractOnERC721Received(from,to,tokenId,_data)){revertTransferToNonERC721ReceiverImplementer();}}',
    '{require(from==_msgSender()||isApprovedForAll(from,_msgSender()),"ERC1155:callerisnotownernorapproved");_safeTransferFrom(from,to,id,amount,data);}',
    '{require(_isApprovedOrOwner(_msgSender(),tokenId),"ERC721:callerisnottokenownernorapproved");_safeTransfer(from,to,tokenId,data);}',
    '{require(_isApprovedOrOwner(_msgSender(),tokenId),"ERC721:callerisnottokenownerorapproved");_safeTransfer(from,to,tokenId,data);}',
    '{require(_isApprovedOrOwner(_msgSender(),tokenId),"ERC721:transfercallerisnotownernorapproved");_safeTransfer(from,to,tokenId,_data);}',
    '{transferFrom(from,to,tokenId);require(_checkOnERC721Received(from,to,tokenId,_data));}',
    '{transferFrom(from,to,tokenId);if(to.code.length!=0)if(!_checkContractOnERC721Received(from,to,tokenId,_data)){revertTransferToNonERC721ReceiverImplementer();}}',
    '{transferFrom(from,to,id);if(!_checkOnERC721Received(from,to,id,data))revertTransferToNonERC721ReceiverImplementer();}',
    '{_callOptionalReturn(token,abi.encodeWithSelector(token.transferFrom.selector,from,to,value));}',
    '{\\rrequire(\\rfrom==_msgSender()||isApprovedForAll(from,_msgSender()),\\r"ERC1155:callerisnottokenownernorapproved"\\r);\\r_safeTransferFrom(from,to,id,amount,data);\\r}',
    '{require(from==_msgSender()||isApprovedForAll(from,_msgSender()),"ERC1155:callerisnottokenownerorapproved");_safeTransferFrom(from,to,id,amount,data);}',
    '{require(from==_msgSender()||isApprovedForAll(from,_msgSender()),"ERC1155:callerisnottokenownernorapproved");_safeTransferFrom(from,to,id,amount,data);}',
    '{require(_to!=address(0x0),"cannotsendtozeroaddress");require(_from==msg.sender||operatorApproval[_from][msg.sender]==true,"Needoperatorapprovalfor3rdpartytransfers.");if(isNonFungible(_id)){require(nfOwners[_id]==_from);nfOwners[_id]=_to;uint256baseType=getNonFungibleBaseType(_id);balances[baseType][_from]=balances[baseType][_from].sub(_value);balances[baseType][_to]=balances[baseType][_to].add(_value);}else{balances[_id][_from]=balances[_id][_from].sub(_value);balances[_id][_to]=balances[_id][_to].add(_value);}emitTransferSingle(msg.sender,_from,_to,_id,_value);if(_to.isContract()){_doSafeTransferAcceptanceCheck(msg.sender,_from,_to,_id,_value,_data);}}',
  ],
  isApprovedOperatorRole: [
    '',
    'returnhasRole(APPROVED_OPERATOR_ROLE,account);}',
    '{returnhasRole(APPROVED_OPERATOR_ROLE,account);}',
  ],
  _isApprovedOrOwner: [
    '{returnsuper._isApprovedOrOwner(spender,tokenId)||super.isApprovedOperatorRole(spender);}',
    '{\\rrequire(_exists(tokenId),"ERC721:operatorqueryfornonexistenttoken");\\raddressowner=ERC721.ownerOf(tokenId);\\rreturn(spender==owner||getApproved(tokenId)==spender||isApprovedForAll(owner,spender));\\r}',
    '{\\rrequire(_exists(tokenId),"ERC721:operatorqueryfornonexistenttoken");\\raddressowner=ERC721.ownerOf(tokenId);\\rreturn(spender==owner||getApproved(tokenId)==spender||isApprovedForAll(owner,spender));\\r}',
    '{addressowner=ERC721.ownerOf(tokenId);return(spender==owner||isApprovedForAll(owner,spender)||getApproved(tokenId)==spender);}',
    '{require(_exists(tokenId),"ERC721:operatorqueryfornonexistenttoken");addressowner=ERC721.ownerOf(tokenId);return(spender==owner||getApproved(tokenId)==spender||ERC721.isApprovedForAll(owner,spender));}',
    '{require(_exists(tokenId),"ERC721:operatorqueryfornonexistenttoken");addressowner=ERC721.ownerOf(tokenId);return(spender==owner||getApproved(tokenId)==spender||isApprovedForAll(owner,spender));}',
    '{addressowner=ownerOf(tokenId);return(spender==owner||getApproved(tokenId)==spender||isApprovedForAll(owner,spender));}',
    '{require(_exists(tokenId),"ERC721:operatorqueryfornonexistenttoken");addressowner=ERC721.ownerOf(tokenId);return(spender==owner||isApprovedForAll(owner,spender)||getApproved(tokenId)==spender);}',
    '{require(_exists(tokenId),"ERC721:operatorqueryfornonexistenttoken");addressowner=ownerOf(tokenId);return(spender==owner||getApproved(tokenId)==spender||isApprovedForAll(owner,spender));}',
  ],
  isApprovedForAll: [
    '',
    '{\\rreturn_operatorApprovals[owner][operator];\\r}',
    '{returnownerToOperators[_owner][_operator];}',
    '{returnoperators[_owner][_operator];}',
    '{\\rreturn_operatorApprovals[account][operator];\\r}',
    '{return_operatorApprovals[account][operator];}',
    '{return_operatorApprovals[owner][operator];}',
    '{returns.operators[owner][operator];}',
    '{returnoperatorApproval[_owner][_operator];}',
  ],
  getApproved: [
    '',
    '{if(!_exists(tokenId))_revert(ApprovalQueryForNonexistentToken.selector);return_tokenApprovals[tokenId].value;}',
    '{\\rrequire(_exists(tokenId),"ERC721:approvedqueryfornonexistenttoken");\\r\\rreturn_tokenApprovals[tokenId];\\r}',
    '{returnidToApproval[_tokenId];}',
    '{require(_exists(tokenId),"ERC721A:approvedqueryfornonexistenttoken");return_tokenApprovals[tokenId];}',
    '{_requireMinted(tokenId);return_tokenApprovals[tokenId];}',
    '{require(_exists(tokenId),"ERC721:approvedqueryfornonexistenttoken");return_tokenApprovals[tokenId];}',
    '{require(_exists(tokenId));return_tokenApprovals[tokenId];}',
    '{if(!_exists(tokenId))revertApprovalQueryForNonexistentToken();return_tokenApprovals[tokenId].value;}',
    '{if(!_exists(tokenId))revertApprovalQueryForNonexistentToken();return_tokenApprovals[tokenId];}',
    '{if(!_exists(tokenId))revertApprovalQueryForNonexistentToken();return_tokenApprovals[tokenId].value;}',
    '{if(!_exists(tokenId))revertApprovalQueryForNonexistentToken();return_tokenApprovals[tokenId];}',
    '{uint256owner=s.owners[tokenId];require(_tokenExists(owner),"ERC721:non-existingtoken");if(_tokenHasApproval(owner)){returns.approvals[tokenId];}else{returnaddress(0);}}',
  ],
  _safeTransfer: [
    '',
    '{\\r_transfer(from,to,tokenId);\\rrequire(_checkOnERC721Received(from,to,tokenId,_data),"ERC721:transfertononERC721Receiverimplementer");\\r}',
    '{_transfer(from,to,tokenId);require(_checkOnERC721Received(from,to,tokenId,data),"ERC721:transfertononERC721Receiverimplementer");}',
    '{_transfer(from,to,tokenId);require(_checkOnERC721Received(from,to,tokenId,_data),"ERC721:transfertononERC721Receiverimplementer");}',
    '{addresstokenOwner=idToOwner[_tokenId];require(tokenOwner==_from,"Incorrectowner.");require(_to!=address(0));_transfer(_to,_tokenId);if(isContract(_to)){bytes4retval=ERC721TokenReceiver(_to).onERC721Received(msg.sender,_from,_tokenId,_data);require(retval==MAGIC_ON_ERC721_RECEIVED);}}',
  ],
  TokenOwnership: [''],
  _clearApproval: [
    '{if(idToApproval[_tokenId]!=address(0)){deleteidToApproval[_tokenId];}}',
    '{if(_tokenApprovals[tokenId]!=address(0)){_tokenApprovals[tokenId]=address(0);}}',
  ],
  _removeNFToken: [
    '{require(idToOwner[_tokenId]==_from,"Incorrectowner.");deleteidToOwner[_tokenId];uint256tokenToRemoveIndex=idToOwnerIndex[_tokenId];uint256lastTokenIndex=ownerToIds[_from].length.sub(1);if(lastTokenIndex!=tokenToRemoveIndex){uint256lastToken=ownerToIds[_from][lastTokenIndex];ownerToIds[_from][tokenToRemoveIndex]=lastToken;idToOwnerIndex[lastToken]=tokenToRemoveIndex;}ownerToIds[_from].pop();}',
  ],
  _addNFToken: [
    '{require(idToOwner[_tokenId]==address(0),"Cannotadd,alreadyowned.");idToOwner[_tokenId]=_to;ownerToIds[_to].push(_tokenId);idToOwnerIndex[_tokenId]=ownerToIds[_to].length.sub(1);}',
  ],
  _afterTokenTransfers: ['{}', ''],
  _transfer: [
    `{require(ERC721.ownerOf(tokenId)==from,"ERC721:transferfromincorrectowner");require(to!=address(0),"ERC721:transfertothezeroaddress");_beforeTokenTransfer(from,to,tokenId,1);//CheckthattokenIdwasnottransferredby_beforeTokenTransferhookrequire(ERC721.ownerOf(tokenId)==from,"ERC721:transferfromincorrectowner");//Clearapprovalsfromthepreviousownerdelete_tokenApprovals[tokenId];unchecked{//_balances[from]cannotoverflowforthesamereasonasdescribedin_burn://from'sbalanceisthenumberoftokenheld,whichisatleastonebeforethecurrent//transfer.//_balances[to]couldoverflowintheconditionsdescribedin_mint.Thatwouldrequire//all2**256tokenidstobeminted,whichinpracticeisimpossible._balances[from]-=1;_balances[to]+=1;}_owners[tokenId]=to;emitTransfer(from,to,tokenId);_afterTokenTransfer(from,to,tokenId,1);}`,
    '{TokenOwnershipmemoryprevOwnership=ownershipOf(tokenId);boolisApprovedOrOwner=(_msgSender()==prevOwnership.addr||isApprovedForAll(prevOwnership.addr,_msgSender())||getApproved(tokenId)==_msgSender());if(!isApprovedOrOwner)revertTransferCallerNotOwnerNorApproved();if(prevOwnership.addr!=from)revertTransferFromIncorrectOwner();if(to==address(0))revertTransferToZeroAddress();_beforeTokenTransfers(from,to,tokenId,1);_approve(address(0),tokenId,prevOwnership.addr);unchecked{_addressData[from].balance-=1;_addressData[to].balance+=1;_ownerships[tokenId].addr=to;_ownerships[tokenId].startTimestamp=uint64(block.timestamp);uint256nextTokenId=tokenId+1;if(_ownerships[nextTokenId].addr==address(0)){if(nextTokenId<_currentIndex){_ownerships[nextTokenId].addr=prevOwnership.addr;_ownerships[nextTokenId].startTimestamp=prevOwnership.startTimestamp;}}}emitTransfer(from,to,tokenId);_afterTokenTransfers(from,to,tokenId,1);}',
    '{require(ERC721.ownerOf(tokenId)==from,"ERC721:transferoftokenthatisnotown");require(to!=address(0),"ERC721:transfertothezeroaddress");_beforeTokenTransfer(from,to,tokenId);_approve(address(0),tokenId);_holderTokens[from].remove(tokenId);_holderTokens[to].add(tokenId);_tokenOwners.set(tokenId,to);emitTransfer(from,to,tokenId);}',
    '{\\rrequire(ERC721.ownerOf(tokenId)==from,"ERC721:transferoftokenthatisnotown");\\rrequire(to!=address(0),"ERC721:transfertothezeroaddress");\\r\\r_beforeTokenTransfer(from,to,tokenId);\\r\\r_approve(address(0),tokenId);\\r\\r_balances[from]-=1;\\r_balances[to]+=1;\\r_owners[tokenId]=to;\\r\\remitTransfer(from,to,tokenId);\\r}',
    '{addressfrom=idToOwner[_tokenId];_clearApproval(_tokenId);_removeNFToken(from,_tokenId);_addNFToken(_to,_tokenId);emitTransfer(from,_to,_tokenId);}',
    `{TokenOwnershipmemoryprevOwnership=ownershipOf(tokenId);boolisApprovedOrOwner=(_msgSender()==prevOwnership.addr||getApproved(tokenId)==_msgSender()||isApprovedForAll(prevOwnership.addr,_msgSender()));require(isApprovedOrOwner,"ERC721A:transfercallerisnotownernorapproved");require(prevOwnership.addr==from,"ERC721A:transferfromincorrectowner");require(to!=address(0),"ERC721A:transfertothezeroaddress");_beforeTokenTransfers(from,to,tokenId,1);//Clearapprovalsfromthepreviousowner_approve(address(0),tokenId,prevOwnership.addr);_addressData[from].balance-=1;_addressData[to].balance+=1;_ownerships[tokenId]=TokenOwnership(to,uint64(block.timestamp));//IftheownershipslotoftokenId+1isnotexplicitlyset,thatmeansthetransferinitiatorownsit.//SettheslotoftokenId+1explicitlyinstoragetomaintaincorrectnessforownerOf(tokenId+1)calls.uint256nextTokenId=tokenId+1;if(_ownerships[nextTokenId].addr==address(0)){if(_exists(nextTokenId)){_ownerships[nextTokenId]=TokenOwnership(prevOwnership.addr,prevOwnership.startTimestamp);}}emitTransfer(from,to,tokenId);_afterTokenTransfers(from,to,tokenId,1);}`,
    '{TokenOwnershipmemoryprevOwnership=_ownershipOf(tokenId);if(prevOwnership.addr!=from)revertTransferFromIncorrectOwner();boolisApprovedOrOwner=(_msgSender()==from||isApprovedForAll(from,_msgSender())||getApproved(tokenId)==_msgSender());if(!isApprovedOrOwner)revertTransferCallerNotOwnerNorApproved();if(to==address(0))revertTransferToZeroAddress();_beforeTokenTransfers(from,to,tokenId,1);_approve(address(0),tokenId,from);unchecked{_addressData[from].balance-=1;_addressData[to].balance+=1;TokenOwnershipstoragecurrSlot=_ownerships[tokenId];currSlot.addr=to;currSlot.startTimestamp=uint64(block.timestamp);uint256nextTokenId=tokenId+1;TokenOwnershipstoragenextSlot=_ownerships[nextTokenId];if(nextSlot.addr==address(0)){if(nextTokenId!=_currentIndex){nextSlot.addr=from;nextSlot.startTimestamp=prevOwnership.startTimestamp;}}}emitTransfer(from,to,tokenId);_afterTokenTransfers(from,to,tokenId,1);}',
    `{TokenOwnershipmemoryprevOwnership=ownershipOf(tokenId);boolisApprovedOrOwner=(_msgSender()==prevOwnership.addr||getApproved(tokenId)==_msgSender()||isApprovedForAll(prevOwnership.addr,_msgSender()));require(isApprovedOrOwner,"ERC721A:transfercallerisnotownernorapproved");require(prevOwnership.addr==from,"ERC721A:transferfromincorrectowner");require(to!=address(0),"ERC721A:transfertothezeroaddress");_beforeTokenTransfers(from,to,tokenId,1);_approve(address(0),tokenId,prevOwnership.addr);_addressData[from].balance-=1;_addressData[to].balance+=1;_ownerships[tokenId]=TokenOwnership(to,uint64(block.timestamp));uint256nextTokenId=tokenId+1;if(_ownerships[nextTokenId].addr==address(0)){if(_exists(nextTokenId)){_ownerships[nextTokenId]=TokenOwnership(prevOwnership.addr,prevOwnership.startTimestamp);}}emitTransfer(from,to,tokenId);_afterTokenTransfers(from,to,tokenId,1);}`,
    '',
    '{TokenOwnershipmemoryprevOwnership=ownershipOf(tokenId);boolisApprovedOrOwner=(_msgSender()==prevOwnership.addr||getApproved(tokenId)==_msgSender()||isApprovedForAll(prevOwnership.addr,_msgSender()));require(isApprovedOrOwner,"ERC721A:transfercallerisnotownernorapproved");require(prevOwnership.addr==from,"ERC721A:transferfromincorrectowner");require(to!=address(0),"ERC721A:transfertothezeroaddress");_beforeTokenTransfers(from,to,tokenId,1);_approve(address(0),tokenId,prevOwnership.addr);_addressData[from].balance-=1;_addressData[to].balance+=1;_ownerships[tokenId]=TokenOwnership(to,uint64(block.timestamp));uint256nextTokenId=tokenId+1;if(_ownerships[nextTokenId].addr==address(0)){if(_exists(nextTokenId)){_ownerships[nextTokenId]=TokenOwnership(prevOwnership.addr,prevOwnership.startTimestamp);}}emitTransfer(from,to,tokenId);_afterTokenTransfers(from,to,tokenId,1);}',
    '{}',
    '{require(sender!=address(0),"ERC20:transferfromthezeroaddress");require(recipient!=address(0),"ERC20:transfertothezeroaddress");_beforeTokenTransfer(sender,recipient,amount);uint256senderBalance=_balances[sender];require(senderBalance>=amount,"ERC20:transferamountexceedsbalance");unchecked{_balances[sender]=senderBalance-amount;}_balances[recipient]+=amount;emitTransfer(sender,recipient,amount);_afterTokenTransfer(sender,recipient,amount);}',
    '{require(from!=address(0),"ERC20:transferfromthezeroaddress");require(to!=address(0),"ERC20:transfertothezeroaddress");_beforeTokenTransfer(from,to,amount);uint256fromBalance=_balances[from];require(fromBalance>=amount,"ERC20:transferamountexceedsbalance");unchecked{_balances[from]=fromBalance-amount;//Overflownotpossible:thesumofallbalancesiscappedbytotalSupply,andthesumispreservedby//decrementingthenincrementing._balances[to]+=amount;}emitTransfer(from,to,amount);_afterTokenTransfer(from,to,amount);}',
    '{require(ERC721.ownerOf(tokenId)==from,"ERC721:transferoftokenthatisnotown");require(to!=address(0),"ERC721:transfertothezeroaddress");_beforeTokenTransfer(from,to,tokenId);_approve(address(0),tokenId);_balances[from]-=1;_balances[to]+=1;_owners[tokenId]=to;emitTransfer(from,to,tokenId);}',
    '{require(ERC721.ownerOf(tokenId)==from,"ERC721:transferfromincorrectowner");require(to!=address(0),"ERC721:transfertothezeroaddress");_beforeTokenTransfer(from,to,tokenId);//Clearapprovalsfromthepreviousowner_approve(address(0),tokenId);_balances[from]-=1;_balances[to]+=1;_owners[tokenId]=to;emitTransfer(from,to,tokenId);_afterTokenTransfer(from,to,tokenId);}',
    '{require(ERC721.ownerOf(tokenId)==from,"ERC721:transferfromincorrectowner");require(to!=address(0),"ERC721:transfertothezeroaddress");_beforeTokenTransfer(from,to,tokenId);_approve(address(0),tokenId);_balances[from]-=1;_balances[to]+=1;_owners[tokenId]=to;emitTransfer(from,to,tokenId);_afterTokenTransfer(from,to,tokenId);}',
    '{require(ERC721.ownerOf(tokenId)==from,"ERC721:transferfromincorrectowner");require(to!=address(0),"ERC721:transfertothezeroaddress");_beforeTokenTransfer(from,to,tokenId,1);require(ERC721.ownerOf(tokenId)==from,"ERC721:transferfromincorrectowner");delete_tokenApprovals[tokenId];unchecked{_balances[from]-=1;_balances[to]+=1;}_owners[tokenId]=to;emitTransfer(from,to,tokenId);_afterTokenTransfer(from,to,tokenId,1);}',
    '{require(isOwnerOf(from,tokenId),"ERC721:transferoftokenthatisnotown");require(to!=address(0),"ERC721:transfertothezeroaddress");_approve(address(0),tokenId);_balances[from]-=1;_balances[to]+=1;_tokens[tokenId].owner=uint160(to);emitTransfer(from,to,tokenId);}',
    '{require(ERC721.ownerOf(tokenId)==from,"ERC721:transferoftokenthatisnotown");require(to!=address(0),"ERC721:transfertothezeroaddress");_beforeTokenTransfer(from,to,tokenId);//Clearapprovalsfromthepreviousowner_approve(address(0),tokenId);_balances[from]-=1;_balances[to]+=1;_owners[tokenId]=to;emitTransfer(from,to,tokenId);}',
    '{require(from!=address(0),"ERC20:transferfromthezeroaddress");require(to!=address(0),"ERC20:transfertothezeroaddress");_beforeTokenTransfer(from,to,amount);uint256fromBalance=_balances[from];require(fromBalance>=amount,"ERC20:transferamountexceedsbalance");unchecked{_balances[from]=fromBalance-amount;}_balances[to]+=amount;emitTransfer(from,to,amount);_afterTokenTransfer(from,to,amount);}',
    '{require(ERC721.ownerOf(tokenId)==from,"ERC721:transferoftokenthatisnotown");//internalownerrequire(to!=address(0),"ERC721:transfertothezeroaddress");_beforeTokenTransfer(from,to,tokenId);//Clearapprovalsfromthepreviousowner_approve(address(0),tokenId);_holderTokens[from].remove(tokenId);_holderTokens[to].add(tokenId);_tokenOwners.set(tokenId,to);emitTransfer(from,to,tokenId);',
    '{require(ERC721.ownerOf(tokenId)==from,"ERC721:transferoftokenthatisnotown");//internalownerrequire(to!=address(0),"ERC721:transfertothezeroaddress");_beforeTokenTransfer(from,to,tokenId);//Clearapprovalsfromthepreviousowner_approve(address(0),tokenId);_holderTokens[from].remove(tokenId);_holderTokens[to].add(tokenId);_tokenOwners.set(tokenId,to);emitTransfer(from,to,tokenId);}',
    '{require(ownerOf(tokenId)==from,"ERC721:transferoftokenthatisnotown");require(to!=address(0),"ERC721:transfertothezeroaddress");_beforeTokenTransfer(from,to,tokenId);//Clearapprovalsfromthepreviousowner_approve(address(0),tokenId);_holderTokens[from].remove(tokenId);_holderTokens[to].add(tokenId);_tokenOwners.set(tokenId,to);emitTransfer(from,to,tokenId);}',
  ],

  _beforeTokenTransfer: [
    '{}',
    '{if(rentedTokensLandlords[tokenId]!=address(0)){require(super.isApprovedOperatorRole(_msgSender()),"Transferofrentedtokenallowedonlybytheapprovedoperatorrole");}super._beforeTokenTransfer(from,to,tokenId);}',
    `{uint256[]storagesenderTokenList=allTokens[from];for(uint256i;i<ids.length;i++){//addtransferredtokento'to'usertokenlistallTokens[to].push(ids[i]);//findandremovethetransferredtokenfromthe'from'usertokenlist//thecodebelowfindsthetokenid,movesthelasttokentofoundindex//anddecreasesthearraylength.So,theallTokensisanunorderedarrayoftokens.for(uint256j;j<senderTokenList.length;j++){if(senderTokenList[j]==ids[i]){senderTokenList[j]=senderTokenList[senderTokenList.length-1];senderTokenList.pop();}}}}`,
    '{if(beforeTokenTransferHandler!=address(0)){IERC721BeforeTokenTransferHandlerhandlerRef=IERC721BeforeTokenTransferHandler(beforeTokenTransferHandler);handlerRef.beforeTokenTransfer(address(this),_msgSender(),from,to,firstTokenId,batchSize);}for(uint256idx=0;idx<batchSize;idx++){uint256tokenId=firstTokenId+idx;uint32lastTransferTime=lastTransfer[tokenId];uint32currentTime=SafeCast.toUint32(block.timestamp);if(lastTransferTime>0){_timeHeld[tokenId][from]+=(currentTime-lastTransferTime);}lastTransfer[tokenId]=currentTime;}super._beforeTokenTransfer(from,to,firstTokenId,batchSize);}',
    '{super._beforeTokenTransfer(from,to,firstTokenId,batchSize);if(batchSize>1){revert("ERC721Enumerable:consecutivetransfersnotsupported");}uint256tokenId=firstTokenId;if(from==address(0)){_addTokenToAllTokensEnumeration(tokenId);}elseif(from!=to){_removeTokenFromOwnerEnumeration(from,tokenId);}if(to==address(0)){_removeTokenFromAllTokensEnumeration(tokenId);}elseif(to!=from){_addTokenToOwnerEnumeration(to,tokenId);}}',
    '{require(!frozenAccount[from],"frozenaccount");require(!frozenToken[tokenId],"frozentoken");super._beforeTokenTransfer(from,to,tokenId);}',
    '{super._beforeTokenTransfer(from,to,amount);}',
    '{super._beforeTokenTransfer(from,to,tokenId);if(from!=address(0)&&from!=to){_removeTokenFromOwnerEnumeration(from,tokenId);}if(to!=address(0)&&to!=from){_addTokenToOwnerEnumeration(to,tokenId);}}',
    '{super._beforeTokenTransfer(operator,from,to,nftIds,amounts,data);}',
    '{super._beforeTokenTransfer(operator,from,to,ids,amounts,data);for(uint256i=0;i<ids.length;i++){if(from!=address(0)&&balanceOf(from,ids[i])<=amounts[i])_ownedTokens[from].remove(ids[i]);if(to!=address(0)&&balanceOf(to,ids[i])==0)_ownedTokens[to].add(ids[i]);}_players.add(from);_players.add(to);}',
    '{require(whitelisted[from],"!fromnotwhitelisted");require(whitelisted[to],"!tonotwhitelisted");super._beforeTokenTransfer(operator,from,to,ids,amounts,data);}',
    '{super._beforeTokenTransfer(operator,from,to,ids,amounts,data);if(from==address(0)){for(uint256i=0;i<ids.length;++i){_totalSupply[ids[i]]+=amounts[i];}}if(to==address(0)){for(uint256i=0;i<ids.length;++i){_totalSupply[ids[i]]-=amounts[i];}}}',
    '{super._beforeTokenTransfer(operator,from,to,ids,amounts,data);if(from==address(0)){for(uint256i=0;i<ids.length;++i){_totalSupply[ids[i]]+=amounts[i];}}if(to==address(0)){for(uint256i=0;i<ids.length;++i){uint256id=ids[i];uint256amount=amounts[i];uint256supply=_totalSupply[id];require(supply>=amount,"ERC1155:burnamountexceedstotalSupply");unchecked{_totalSupply[id]=supply-amount;}}}}',
    '{super._beforeTokenTransfer(operator,from,to,ids,amounts,data);}',
    '{\\rsuper._beforeTokenTransfer(operator,from,to,ids,amounts,data);\\r}',
    '{super._beforeTokenTransfer(operator,from,to,ids,amounts,data);require(!paused(),"ERC1155Pausable:tokentransferwhilepaused");}',
    '{}',
    '{super._beforeTokenTransfer(from,to,tokenId);}',
    '{if(batchSize>1){if(from!=address(0)){_balances[from]-=batchSize;}if(to!=address(0)){_balances[to]+=batchSize;}}}',
    '{ERC721Enumerable._beforeTokenTransfer(from,to,tokenId);}',
    '{super._beforeTokenTransfer(from,to,tokenId);if(from==address(0)){_addTokenToAllTokensEnumeration(tokenId);}elseif(from!=to){_removeTokenFromOwnerEnumeration(from,tokenId);}if(to==address(0)){_removeTokenFromAllTokensEnumeration(tokenId);}elseif(to!=from){_addTokenToOwnerEnumeration(to,tokenId);}}',
    '{super._beforeTokenTransfer(from,to,tokenId);}',
    '{super._beforeTokenTransfer(from,to,tokenId);require(!paused(),"ERC721Pausable:tokentransferwhilepaused");}',
  ],
  _beforeTokenTransfers: [
    '{}',
    '{require(!frozenAccount[from],"frozenaccount");require(!frozenToken[tokenId],"frozentoken");super._beforeTokenTransfer(from,to,tokenId);}',
    '{super._beforeTokenTransfer(from,to,amount);}',
    '{super._beforeTokenTransfer(from,to,tokenId);if(from!=address(0)&&from!=to){_removeTokenFromOwnerEnumeration(from,tokenId);}if(to!=address(0)&&to!=from){_addTokenToOwnerEnumeration(to,tokenId);}}',
    '{super._beforeTokenTransfer(operator,from,to,nftIds,amounts,data);}',
    '{super._beforeTokenTransfer(operator,from,to,ids,amounts,data);for(uint256i=0;i<ids.length;i++){if(from!=address(0)&&balanceOf(from,ids[i])<=amounts[i])_ownedTokens[from].remove(ids[i]);if(to!=address(0)&&balanceOf(to,ids[i])==0)_ownedTokens[to].add(ids[i]);}_players.add(from);_players.add(to);}',
    '{require(whitelisted[from],"!fromnotwhitelisted");require(whitelisted[to],"!tonotwhitelisted");super._beforeTokenTransfer(operator,from,to,ids,amounts,data);}',
    '{super._beforeTokenTransfer(operator,from,to,ids,amounts,data);if(from==address(0)){for(uint256i=0;i<ids.length;++i){_totalSupply[ids[i]]+=amounts[i];}}if(to==address(0)){for(uint256i=0;i<ids.length;++i){_totalSupply[ids[i]]-=amounts[i];}}}',
    '{super._beforeTokenTransfer(operator,from,to,ids,amounts,data);if(from==address(0)){for(uint256i=0;i<ids.length;++i){_totalSupply[ids[i]]+=amounts[i];}}if(to==address(0)){for(uint256i=0;i<ids.length;++i){uint256id=ids[i];uint256amount=amounts[i];uint256supply=_totalSupply[id];require(supply>=amount,"ERC1155:burnamountexceedstotalSupply");unchecked{_totalSupply[id]=supply-amount;}}}}',
    '{super._beforeTokenTransfer(operator,from,to,ids,amounts,data);}',
    '{\\rsuper._beforeTokenTransfer(operator,from,to,ids,amounts,data);\\r}',
    '{super._beforeTokenTransfer(operator,from,to,ids,amounts,data);require(!paused(),"ERC1155Pausable:tokentransferwhilepaused");}',
    '{}',
    '{super._beforeTokenTransfer(from,to,tokenId);}',
    '{if(batchSize>1){if(from!=address(0)){_balances[from]-=batchSize;}if(to!=address(0)){_balances[to]+=batchSize;}}}',
    '{ERC721Enumerable._beforeTokenTransfer(from,to,tokenId);}',
    '{super._beforeTokenTransfer(from,to,tokenId);if(from==address(0)){_addTokenToAllTokensEnumeration(tokenId);}elseif(from!=to){_removeTokenFromOwnerEnumeration(from,tokenId);}if(to==address(0)){_removeTokenFromAllTokensEnumeration(tokenId);}elseif(to!=from){_addTokenToOwnerEnumeration(to,tokenId);}}',
    '{super._beforeTokenTransfer(from,to,tokenId);}',
    '{super._beforeTokenTransfer(from,to,tokenId);require(!paused(),"ERC721Pausable:tokentransferwhilepaused");}',
  ],
  _nextExtraData: [
    '{uint24extraData=uint24(prevOwnershipPacked\\u003e\\u003e_BITPOS_EXTRA_DATA);returnuint256(_extraData(from,to,extraData))\\u003c\\u003c_BITPOS_EXTRA_DATA;}',
    '{uint24extraData=uint24(prevOwnershipPacked>>_BITPOS_EXTRA_DATA);returnuint256(_extraData(from,to,extraData))<<_BITPOS_EXTRA_DATA;}',
  ],
  _getApprovedSlotAndAddress: [
    '{TokenApprovalRefstoragetokenApproval=_tokenApprovals[tokenId];assembly{approvedAddressSlot:=tokenApproval.slotapprovedAddress:=sload(approvedAddressSlot)}}',
  ],
  _packOwnershipData: [
    '{assembly{owner:=and(owner,_BITMASK_ADDRESS)result:=or(owner,or(shl(_BITPOS_START_TIMESTAMP,timestamp()),flags))}}',
    '{}',
  ],
  transferFrom: [
    '{require(to!=address(this),"Recipientcannotbetheaddressofthecontract");super.transferFrom(from,to,tokenId);rentedTokensLandlords[tokenId]=address(0);}',
    '{require(_isApprovedOrOwner(_msgSender(),tokenId),"ERC721:callerisnottokenownerorapproved");_transfer(from,to,tokenId);}',
    '{//solhint-disable-next-linemax-line-lengthrequire(_isApprovedOrOwner(msg.sender,tokenId),"ERC721:transfercallerisnotownernorapproved");_transferFrom(from,to,tokenId);}',
    '{uint256prevOwnershipPacked=_packedOwnershipOf(tokenId);if(address(uint160(prevOwnershipPacked))!=from)revertTransferFromIncorrectOwner();(uint256approvedAddressSlot,addressapprovedAddress)=_getApprovedSlotAndAddress(tokenId);if(!_isSenderApprovedOrOwner(approvedAddress,from,_msgSenderERC721A()))if(!isApprovedForAll(from,_msgSenderERC721A()))revertTransferCallerNotOwnerNorApproved();if(to==address(0))revertTransferToZeroAddress();_beforeTokenTransfers(from,to,tokenId,1);assembly{ifapprovedAddress{sstore(approvedAddressSlot,0)}}unchecked{--_packedAddressData[from];++_packedAddressData[to];_packedOwnerships[tokenId]=_packOwnershipData(to,_BITMASK_NEXT_INITIALIZED|_nextExtraData(from,to,prevOwnershipPacked));if(prevOwnershipPacked\\u0026_BITMASK_NEXT_INITIALIZED==0){uint256nextTokenId=tokenId+1;if(_packedOwnerships[nextTokenId]==0){if(nextTokenId!=_currentIndex){_packedOwnerships[nextTokenId]=prevOwnershipPacked;}}}}emitTransfer(from,to,tokenId);_afterTokenTransfers(from,to,tokenId,1);}',
    '{\\rsuper.transferFrom(from,to,tokenId);\\r}',
    '{\\rrequire(_isApprovedOrOwner(_msgSender(),tokenId),"ERC721:transfercallerisnotownernorapproved");\\r\\r_transfer(from,to,tokenId);\\r}',
    '{addresstokenOwner=idToOwner[_tokenId];require(tokenOwner==_from,"Wrongfromaddress.");require(_to!=address(0),"Cannotsendto0x0.");_transfer(_to,_tokenId);}',
    '{_transfer(from,to,tokenId);}',
    '{uint256prevOwnershipPacked=_packedOwnershipOf(tokenId);if(address(uint160(prevOwnershipPacked))!=from)revertTransferFromIncorrectOwner();(uint256approvedAddressSlot,addressapprovedAddress)=_getApprovedSlotAndAddress(tokenId);if(!_isSenderApprovedOrOwner(approvedAddress,from,_msgSenderERC721A()))if(!isApprovedForAll(from,_msgSenderERC721A()))revertTransferCallerNotOwnerNorApproved();if(to==address(0))revertTransferToZeroAddress();_beforeTokenTransfers(from,to,tokenId,1);assembly{ifapprovedAddress{sstore(approvedAddressSlot,0)}}unchecked{--_packedAddressData[from];++_packedAddressData[to];_packedOwnerships[tokenId]=_packOwnershipData(to,_BITMASK_NEXT_INITIALIZED|_nextExtraData(from,to,prevOwnershipPacked));if(prevOwnershipPacked&_BITMASK_NEXT_INITIALIZED==0){uint256nextTokenId=tokenId+1;if(_packedOwnerships[nextTokenId]==0){if(nextTokenId!=_currentIndex){_packedOwnerships[nextTokenId]=prevOwnershipPacked;}}}}emitTransfer(from,to,tokenId);_afterTokenTransfers(from,to,tokenId,1);}',
    '{super.transferFrom(from,to,tokenId);}',
    `{require(CanTransfer,"YouneedTransferToken");if(!_exists(tokenId))revertOwnerQueryForNonexistentToken();if(ownerOf(tokenId)!=from)revertTransferFromIncorrectOwner();if(to==address(0))revertTransferToZeroAddress();boolisApprovedOrOwner=(msg.sender==from||msg.sender==getApproved(tokenId)||isApprovedForAll(from,msg.sender));if(!isApprovedOrOwner)revertTransferCallerNotOwnerNorApproved();//deletetokenapprovalsfrompreviousownerdelete_tokenApprovals[tokenId];_owners[tokenId]=to;//iftokenIDbelowtransferredoneisntset,setittopreviousowner//iftokenidiszero,skipthistopreventunderflowif(tokenId>0&&_owners[tokenId-1]==address(0)){_owners[tokenId-1]=from;}emitTransfer(from,to,tokenId);}`,
    '{_transfer(sender,recipient,amount);uint256currentAllowance=_allowances[sender][_msgSender()];require(currentAllowance>=amount,"ERC20:transferamountexceedsallowance");unchecked{_approve(sender,_msgSender(),currentAllowance-amount);}returntrue;}',
    '{require(_isApprovedOrOwner(_msgSender(),tokenId),"ERC721:transfercallerisnotownernorapproved");_transfer(from,to,tokenId);}',
    '{require(_isApprovedOrOwner(_msgSender(),tokenId),"ERC721:callerisnottokenownernorapproved");_transfer(from,to,tokenId);}',
    '{require(_isApprovedOrOwner(_msgSender(),tokenId),"ERC721:callerisnottokenownernorapproved");_transfer(from,to,tokenId);}',
    '{//solhint-disable-next-linemax-line-lengthrequire(_isApprovedOrOwner(_msgSender(),tokenId),"ERC721:callerisnottokenownernorapproved");_transfer(from,to,tokenId);}',
    '{//solhint-disable-next-linemax-line-lengthrequire(_isApprovedOrOwner(_msgSender(),tokenId),"ERC721:transfercallerisnotownernorapproved");_transfer(from,to,tokenId);}',
    '{addressspender=_msgSender();_spendAllowance(from,spender,amount);_transfer(from,to,amount);returntrue;}',
    '{require(to!=address(0),"ERC721:transfertoaddress(0)");uint256owner=s.owners[tokenId];require(_tokenExists(owner),"ERC721:non-existingtoken");require(_tokenOwner(owner)==from,"ERC721:non-ownedtoken");if(!_isOperatable(s,from,sender)){require(_tokenHasApproval(owner)&&sender==s.approvals[tokenId],"ERC721:non-approvedsender");}s.owners[tokenId]=uint256(uint160(to));if(from!=to){unchecked{--s.balances[from];++s.balances[to];}}emitTransfer(from,to,tokenId);}',
  ],
  _packedOwnershipOf: [
    '{uint256curr=tokenId;unchecked{if(_startTokenId()<=curr)if(curr<_currentIndex){uint256packed=_packedOwnerships[curr];//Ifnotburned.if(packed&_BITMASK_BURNED==0){//Invariant://Therewillalwaysbeaninitializedownershipslot//(i.e.`ownership.addr!=address(0)&&ownership.burned==false`)//beforeanunintializedownershipslot//(i.e.`ownership.addr==address(0)&&ownership.burned==false`)//Hence,`curr`willnotunderflow.////Wecandirectlycomparethepackedvalue.//Iftheaddressiszero,packedwillbezero.while(packed==0){packed=_packedOwnerships[--curr];}returnpacked;}}}revertOwnerQueryForNonexistentToken();}',
    '{}',
    '{uint256curr=tokenId;unchecked{if(_startTokenId()\\u003c=curr)if(curr\\u003c_currentIndex){uint256packed=_packedOwnerships[curr];if(packed\\u0026_BITMASK_BURNED==0){while(packed==0){packed=_packedOwnerships[--curr];}returnpacked;}}}revertOwnerQueryForNonexistentToken();}',
    '{if(_startTokenId()<=tokenId){packed=_packedOwnerships[tokenId];if(packed&_BITMASK_BURNED==0){if(packed==0){if(tokenId>=_currentIndex)_revert(OwnerQueryForNonexistentToken.selector);for(;;){unchecked{packed=_packedOwnerships[--tokenId];}if(packed==0)continue;returnpacked;}}returnpacked;}}_revert(OwnerQueryForNonexistentToken.selector);}',
    '{uint256curr=tokenId;unchecked{if(_startTokenId()<=curr)if(curr<_currentIndex){uint256packed=_packedOwnerships[curr];if(packed&_BITMASK_BURNED==0){while(packed==0){packed=_packedOwnerships[--curr];}returnpacked;}}}revertOwnerQueryForNonexistentToken();}',
  ],
  skipthistopreventunderflowif: ['{}', ''],
  _ownershipOf: [
    '{return_unpackedOwnership(_packedOwnershipOf(tokenId));}',
    '{}',
    '',
    '{uint256curr=tokenId;unchecked{if(_startTokenId()<=curr&&curr<_currentIndex){TokenOwnershipmemoryownership=_ownerships[curr];if(!ownership.burned){if(ownership.addr!=address(0)){returnownership;}while(true){curr--;ownership=_ownerships[curr];if(ownership.addr!=address(0)){returnownership;}}}}}revertOwnerQueryForNonexistentToken();}',
  ],
  TransferFromIncorrectOwner: ['{}', ''],
  TransferToZeroAddress: ['{}', ''],
  isContract: [
    '{//Thismethodreliesinextcodesize,whichreturns0forcontractsin//construction,sincethecodeisonlystoredattheendofthe//constructorexecution.uint256size;//solhint-disable-next-lineno-inline-assemblyassembly{size:=extcodesize(account)}returnsize>0;}',
    '{uint256size;assembly{size:=extcodesize(_addr)}//solhint-disable-lineaddressCheck=size>0;}',
    '{bytes32codehash;//Currentlythereisnobetterwaytocheckifthereisacontractinanaddress//thantocheckthesizeofthecodeatthataddressorifithasanon-zerocodehashoraccounthashassembly{codehash:=extcodehash(_address)}return(codehash!=0x0&&codehash!=ACCOUNT_HASH);}',
    '{uint256size;assembly{size:=extcodesize(account)}returnsize>0;}',
    '{returnaccount.code.length>0;}',
    '{//Thismethodreliesonextcodesize/address.code.length,whichreturns0//forcontractsinconstruction,sincethecodeisonlystoredattheend//oftheconstructorexecution.returnaccount.code.length>0;}',
    '{//Thismethodreliesonextcodesize,whichreturns0forcontractsin//construction,sincethecodeisonlystoredattheendofthe//constructorexecution.uint256size;assembly{size:=extcodesize(account)}returnsize>0;}',
    '{//Thismethodreliesonextcodesize,whichreturns0forcontractsin//construction,sincethecodeisonlystoredattheendofthe//constructorexecution.uint256size;//solhint-disable-next-lineno-inline-assemblyassembly{size:=extcodesize(account)}returnsize>0;}',
    '{\\t\\t\\t\\tuint256size=0;\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\tassembly{\\t\\t\\t\\t\\t\\tsize:=extcodesize(addr)\\t\\t}\\t\\t\\t\\treturnsize>0;\\t}',
    `{uint256size;assembly{size:=extcodesize(account)}returnsize\\u003e0;}`,
  ],
  _requireMinted: ['{require(_exists(tokenId),"ERC721:invalidtokenID");}'],
  getNumMinted: ['{return_tokens.length-1;}'],
  isOwnerOf: ['', '{}', '{addressowner=ownerOf(id);returnowner==account;}'],
  paused: [
    '{return_paused||_gameRegistry.paused();}',
    '{}',
    '{return_paused;}',
    '{\\rfor(uint256id;id<items.length;id++){\\ritems[id].isPaused=_isPaused;\\r}\\r}',
  ],
  _addTokenToAllTokensEnumeration: [
    '',
    '{_allTokensIndex[tokenId]=_allTokens.length;_allTokens.push(tokenId);}',
    '{}',
  ],
  _removeTokenFromOwnerEnumeration: [
    `{//Topreventagapinfrom'stokensarray,westorethelasttokenintheindexofthetokentodelete,and//thendeletethelastslot(swapandpop).uint256lastTokenIndex=_ownedTokens[from].length.sub(1);uint256tokenIndex=_ownedTokensIndex[tokenId];//Whenthetokentodeleteisthelasttoken,theswapoperationisunnecessaryif(tokenIndex!=lastTokenIndex){uint256lastTokenId=_ownedTokens[from][lastTokenIndex];_ownedTokens[from][tokenIndex]=lastTokenId;//Movethelasttokentotheslotoftheto-deletetoken_ownedTokensIndex[lastTokenId]=tokenIndex;//Updatethemovedtoken'sindex}//Thisalsodeletesthecontentsatthelastpositionofthearray_ownedTokens[from].length--;//Notethat_ownedTokensIndex[tokenId]hasn'tbeencleared:itstillpointstotheoldslot(nowoccupiedby//lastTokenId,orjustovertheendofthearrayifthetokenwasthelastone).}`,
    `{//Topreventagapinfrom'stokensarray,westorethelasttokenintheindexofthetokentodelete,and//thendeletethelastslot(swapandpop).uint256lastTokenIndex=ERC721.balanceOf(from)-1;uint256tokenIndex=_ownedTokensIndex[tokenId];//Whenthetokentodeleteisthelasttoken,theswapoperationisunnecessaryif(tokenIndex!=lastTokenIndex){uint256lastTokenId=_ownedTokens[from][lastTokenIndex];_ownedTokens[from][tokenIndex]=lastTokenId;//Movethelasttokentotheslotoftheto-deletetoken_ownedTokensIndex[lastTokenId]=tokenIndex;//Updatethemovedtoken'sindex}//Thisalsodeletesthecontentsatthelastpositionofthearraydelete_ownedTokensIndex[tokenId];delete_ownedTokens[from][lastTokenIndex];}`,
    '',
    '{uint256lastTokenIndex=ERC721.balanceOf(from)-1;uint256tokenIndex=_ownedTokensIndex[tokenId];if(tokenIndex!=lastTokenIndex){uint256lastTokenId=_ownedTokens[from][lastTokenIndex];_ownedTokens[from][tokenIndex]=lastTokenId;_ownedTokensIndex[lastTokenId]=tokenIndex;}delete_ownedTokensIndex[tokenId];delete_ownedTokens[from][lastTokenIndex];}',
    '{}',
  ],
  _ownerOf: ['{return_owners[tokenId];}'],
  AddBalance: [
    '',
    '{}',
    '{require(tokenId<type(uint96).max,"Outofrange");BalanceKeykey=toBalanceKey(account,tokenId);BalanceAmountcurrentBalance=_balanceOf[key];if(currentBalance.getPosition()>0){//Simpleadd_balanceOf[key]=currentBalance.add(amount);}else{uint96[]storagerefTokenIds=tokensHeld[account];uint256length=refTokenIds.length;if(length==0){//AddemptyzeroitemrefTokenIds.push();refTokenIds.push(uint96(tokenId));_balanceOf[key]=BalanceAmount.wrap((uint256(amount)<<16)|1);}else{require(length<type(uint16).max,"Toomanytypes");uint16position=uint16(length);refTokenIds.push(uint96(tokenId));_balanceOf[key]=BalanceAmount.wrap((uint256(amount)<<16)|position);}}totalSupply+=amount;}',
  ],
  get: [
    '',
    '{}',
    `{returnaddress(uint160(uint256(_get(map._inner,bytes32(key),errorMessage))));}`,
  ],
  _get: [
    '{uint256keyIndex=map._indexes[key];require(keyIndex!=0,errorMessage);returnmap._entries[keyIndex-1]._value;}',
    '{}',
    `{uint256keyIndex=map._indexes[key];require(keyIndex!=0,errorMessage);//Equivalenttocontains(map,key)returnmap._entries[keyIndex-1]._value;//Allindexesare1-based}`,
  ],
  remove: [
    '',
    '{}',
    '{return_remove(set._inner,bytes32(value));}',
    '{deleteminters[_minter];emitMinterRoleRevoked(_minter);}',
    '{return_remove(map._inner,bytes32(key));}',
  ],
  set: [
    '',
    '{}',
    `{return_set(map._inner,bytes32(key),bytes32(uint256(uint160(value))));}`,
  ],
  _set: [
    '{uint256keyIndex=map._indexes[key];if(keyIndex==0){map._entries.push(MapEntry({_key:key,_value:value}));map._indexes[key]=map._entries.length;returntrue;}else{map._entries[keyIndex-1]._value=value;returnfalse;}}',
    '{}',
    `{return_set(map._inner,bytes32(key),bytes32(uint256(uint160(value))));}`,
    `{//Wereadandstorethekey'sindextopreventmultiplereadsfromthesamestorageslotuint256keyIndex=map._indexes[key];if(keyIndex==0){//Equivalentto!contains(map,key)map._entries.push(MapEntry({_key:key,_value:value}));//Theentryisstoredatlength-1,butweadd1toallindexes//anduse0asasentinelvaluemap._indexes[key]=map._entries.length;returntrue;}else{map._entries[keyIndex-1]._value=value;returnfalse;}}`,
  ],
  _pushBurn: [
    '',
    '{}',
    '{require(amount>0,"non-positiveamount");_burns[account][nftId]+=amount*block.timestamp;_burnsTotal[nftId]+=amount*block.timestamp;}',
  ],
  _pushMint: [
    '',
    '{}',
    '{require(amount>0,"non-positiveamount");_mints[account][nftId]+=amount*block.timestamp;_mintsTotal[nftId]+=amount*block.timestamp;}',
  ],
  _callonERC1155Received: [
    '',
    '{}',
    '{//Checkifrecipientiscontractif(_to.isContract()){bytes4retval=IERC1155TokenReceiver(_to).onERC1155Received{gas:_gasLimit}(msg.sender,_from,_id,_amount,_data);if(retval!=ERC1155_RECEIVED_VALUE)revertInvalidOnReceiveMsg();}}',
  ],
  sub: [
    '{require(b<=a,errorMessage);uint256c=a-b;returnc;}',
    '{require(b<=a);returna-b;}',
    '{require(b<=a,"SafeMath:subtractionoverflow");uint256c=a-b;returnc;}',
    '{require(b<=a,errorMessage);returna-b;}',
    '{}',
    '{require(b<=a,errorMessage);uintc=a-b;returnc;}',
    '{assert(b\\u003c=a);returna-b;}',
    '{assert(b<=a);returna-b;}',
    '{unchecked{require(b<=a,errorMessage);returna-b;}}',
  ],
  ownershipOf: [
    '',
    '{}',
    '{uint256curr=tokenId;unchecked{if(_startTokenId()<=curr&&curr<_currentIndex){TokenOwnershipmemoryownership=_ownerships[curr];if(!ownership.burned){if(ownership.addr!=address(0)){returnownership;}while(true){curr--;ownership=_ownerships[curr];if(ownership.addr!=address(0)){returnownership;}}}}}revertOwnerQueryForNonexistentToken();}',
    '{uint256curr=tokenId;unchecked{if(_startTokenId()<=curr&&curr<currentIndex){TokenOwnershipmemoryownership=_ownerships[curr];if(ownership.addr!=address(0)){returnownership;}//Invariant://Therewillalwaysbeanownershipthathasanaddressandisnotburned//beforeanownershipthatdoesnothaveanaddressandisnotburned.//Hence,currwillnotunderflow.while(true){curr--;ownership=_ownerships[curr];if(ownership.addr!=address(0)){returnownership;}}}}revert("ERC721A:unabletodeterminetheowneroftoken");}',
    '{require(_exists(tokenId),"ERC721A:ownerqueryfornonexistenttoken");uint256lowestTokenToCheck;if(tokenId>=maxBatchSize){lowestTokenToCheck=tokenId-maxBatchSize+1;}for(uint256curr=tokenId;curr>=lowestTokenToCheck;curr--){TokenOwnershipmemoryownership=_ownerships[curr];if(ownership.addr!=address(0)){returnownership;}}revert("ERC721A:unabletodeterminetheowneroftoken");}',
  ],
  functionCall: [
    '{return_functionCallWithValue(target,data,0,errorMessage);}',
    '{}',
    '{returnfunctionCallWithValue(target,data,0,errorMessage);}',
  ],
  _functionCallWithValue: [
    '{require(isContract(target),"Address:calltonon-contract");(boolsuccess,bytesmemoryreturndata)=target.call{value:weiValue}(data);if(success){returnreturndata;}else{if(returndata.length>0){assembly{letreturndata_size:=mload(returndata)revert(add(32,returndata),returndata_size)}}else{revert(errorMessage);}}}',
    '{require(address(this).balance>=value,"Address:insufficientbalanceforcall");return_functionCallWithValue(target,data,value,errorMessage);}',
    '{}',
  ],
  functionCallWithValue: [
    '',
    '{require(address(this).balance>=value,"Address:insufficientbalanceforcall");return_functionCallWithValue(target,data,value,errorMessage);}',
    '{}',
    '{require(address(this).balance>=value,"Address:insufficientbalanceforcall");require(isContract(target),"Address:calltonon-contract");//solhint-disable-next-lineavoid-low-level-calls(boolsuccess,bytesmemoryreturndata)=target.call{value:value}(data);return_verifyCallResult(success,returndata,errorMessage);}',
    '{require(address(this).balance>=value,"Address:insufficientbalanceforcall");require(isContract(target),"Address:calltonon-contract");(boolsuccess,bytesmemoryreturndata)=target.call{value:value}(data);return_verifyCallResult(success,returndata,errorMessage);}',
    '{require(address(this).balance>=value,"Address:insufficientbalanceforcall");(boolsuccess,bytesmemoryreturndata)=target.call{value:value}(data);returnverifyCallResultFromTarget(target,success,returndata,errorMessage);}',
    '{require(address(this).balance>=value,"Address:insufficientbalanceforcall");require(isContract(target),"Address:calltonon-contract");(boolsuccess,bytesmemoryreturndata)=target.call{value:value}(data);returnverifyCallResult(success,returndata,errorMessage);}',
  ],
  verifyCallResultFromTarget: [
    '',
    '{if(success){if(returndata.length==0){//onlycheckisContractifthecallwassuccessfulandthereturndataisempty//otherwisewealreadyknowthatitwasacontractrequire(isContract(target),"Address:calltonon-contract");}returnreturndata;}else{_revert(returndata,errorMessage);}}',
    '{}',
    '{if(success){if(returndata.length==0){require(isContract(target),"Address:calltonon-contract");}returnreturndata;}else{_revert(returndata,errorMessage);}}',
  ],
  _revert: [
    '',
    '{assembly{mstore(0x00,errorSelector)revert(0x00,0x04)}}',
    '{//Lookforrevertreasonandbubbleitupifpresentif(returndata.length>0){//Theeasiestwaytobubbletherevertreasonisusingmemoryviaassembly///@soliditymemory-safe-assemblyassembly{letreturndata_size:=mload(returndata)revert(add(32,returndata),returndata_size)}}else{revert(errorMessage);}}',
    '{}',
    '{if(returndata.length>0){assembly{letreturndata_size:=mload(returndata)revert(add(32,returndata),returndata_size)}}else{revert(errorMessage);}}',
  ],
  _callOptionalReturn: [
    `{//Weneedtoperformalowlevelcallhere,tobypassSolidity'sreturndatasizecheckingmechanism,since//we'reimplementingitourselves.Weuse{Address.functionCall}toperformthiscall,whichverifiesthat//thetargetaddresscontainscontractcodeandalsoassertsforsuccessinthelow-levelcall.bytesmemoryreturndata=address(token).functionCall(data,"SafeERC20:low-levelcallfailed");if(returndata.length>0){//Returndataisoptionalrequire(abi.decode(returndata,(bool)),"SafeERC20:ERC20operationdidnotsucceed");}}`,
    `{//Weneedtoperformalowlevelcallhere,tobypassSolidity'sreturndatasizecheckingmechanism,since//we'reimplementingitourselves.Weuse{Address-functionCall}toperformthiscall,whichverifiesthat//thetargetaddresscontainscontractcodeandalsoassertsforsuccessinthelow-levelcall.bytesmemoryreturndata=address(token).functionCall(data,"SafeERC20:low-levelcallfailed");if(returndata.length>0){//Returndataisoptionalrequire(abi.decode(returndata,(bool)),"SafeERC20:ERC20operationdidnotsucceed");}}`,
    '{bytesmemoryreturndata=address(token).functionCall(data,"SafeERC20:low-levelcallfailed");if(returndata.length>0){require(abi.decode(returndata,(bool)),"SafeERC20:ERC20operationdidnotsucceed");}}',
    '',
    '{}',
  ],
  _safeTransferFrom: [
    '{addresstokenOwner=idToOwner[_tokenId];require(tokenOwner==_from,"Incorrectowner.");require(_to!=address(0));_transfer(_to,_tokenId);if(isContract(_to)){bytes4retval=ERC721TokenReceiver(_to).onERC721Received(msg.sender,_from,_tokenId,_data);require(retval==MAGIC_ON_ERC721_RECEIVED);}}',
    '{//Updatebalances_updateIDBalance(_from,_id,_amount,Operations.Sub);//Subtractamountfromsender_updateIDBalance(_to,_id,_amount,Operations.Add);//Addamounttorecipient//EmiteventemitTransferSingle(msg.sender,_from,_to,_id,_amount);}',
    '{require(from!=address(0),"ERC1155:transferfromthezeroaddress");require(to!=address(0),"ERC1155:transfertothezeroaddress");addressoperator=_msgSender();_beforeTokenTransfer(operator,from,to,_asSingletonArray(id),_asSingletonArray(amount),data);uint256fromBalance=_balances[id][from];require(fromBalance>=amount,"ERC1155:insufficientbalancefortransfer");unchecked{_balances[id][from]=fromBalance-amount;}_balances[id][to]+=amount;emitTransferSingle(operator,from,to,id,amount);_doSafeTransferAcceptanceCheck(operator,from,to,id,amount,data);}',
    '{require(to!=address(0),"ERC1155:transfertothezeroaddress");addressoperator=_msgSender();SubtractBalance(from,id,amount);AddBalance(to,id,amount);emitTransferSingle(operator,from,to,id,amount);_doSafeTransferAcceptanceCheck(operator,from,to,id,amount,data);}',
    '{//require(to!=address(0),"ERC1155:transfertothezeroaddress");addressoperator=_msgSender();uint256[]memoryids=_asSingletonArray(id);uint256[]memoryamounts=_asSingletonArray(amount);_beforeTokenTransfer(operator,from,to,ids,amounts,data);uint256fromBalance=_balances[id][from];require(fromBalance>=amount,"ERC1155:insufficientbalancefortransfer");unchecked{_balances[id][from]=fromBalance-amount;}_balances[id][to]+=amount;emitTransferSingle(operator,from,to,id,amount);_afterTokenTransfer(operator,from,to,ids,amounts,data);_doSafeTransferAcceptanceCheck(operator,from,to,id,amount,data);}',
    '{require(to!=address(0),"ERC1155:transfertothezeroaddress");addressoperator=_msgSender();_beforeTokenTransfer(operator,from,to,_asSingletonArray(id),_asSingletonArray(amount),data);uint256fromBalance=_balances[id][from];require(fromBalance>=amount,"ERC1155:insufficientbalancefortransfer");unchecked{_balances[id][from]=fromBalance-amount;}_balances[id][to]+=amount;emitTransferSingle(operator,from,to,id,amount);_doSafeTransferAcceptanceCheck(operator,from,to,id,amount,data);}',
    '',
    '{\\rrequire(to!=address(0),"ERC1155:transfertothezeroaddress");\\r\\raddressoperator=_msgSender();\\ruint256[]memoryids=_asSingletonArray(id);\\ruint256[]memoryamounts=_asSingletonArray(amount);\\r\\r_beforeTokenTransfer(operator,from,to,ids,amounts,data);\\r\\ruint256fromBalance=_balances[id][from];\\rrequire(\\rfromBalance>=amount,\\r"ERC1155:insufficientbalancefortransfer"\\r);\\runchecked{\\r_balances[id][from]=fromBalance-amount;\\r}\\r_balances[id][to]+=amount;\\r\\remitTransferSingle(operator,from,to,id,amount);\\r\\r_afterTokenTransfer(operator,from,to,ids,amounts,data);\\r\\r_doSafeTransferAcceptanceCheck(operator,from,to,id,amount,data);\\r}',
    '{}',
    '{require(to!=address(0),"ERC1155:transfertothezeroaddress");addressoperator=_msgSender();uint256[]memoryids=_asSingletonArray(id);uint256[]memoryamounts=_asSingletonArray(amount);_beforeTokenTransfer(operator,from,to,ids,amounts,data);uint256fromBalance=_balances[id][from];require(fromBalance>=amount,"ERC1155:insufficientbalancefortransfer");unchecked{_balances[id][from]=fromBalance-amount;}_balances[id][to]+=amount;emitTransferSingle(operator,from,to,id,amount);_afterTokenTransfer(operator,from,to,ids,amounts,data);_doSafeTransferAcceptanceCheck(operator,from,to,id,amount,data);}',
  ],
  _asSingletonArray: [
    '',
    '{\\ruint256[]memoryarray=newuint256[](1);\\rarray[0]=element;\\r\\rreturnarray;\\r}',
    '{}',
    '{uint256[]memoryarray=newuint256[](1);array[0]=element;returnarray;}',
  ],
  _doSafeTransferAcceptanceCheck: [
    '',
    '{\\rif(to.isContract()){\\rtryIERC1155Receiver(to).onERC1155Received(operator,from,id,amount,data)returns(bytes4response){\\rif(response!=IERC1155Receiver(to).onERC1155Received.selector){\\rrevert("ERC1155:ERC1155Receiverrejectedtokens");\\r}\\r}catchError(stringmemoryreason){\\rrevert(reason);\\r}catch{\\rrevert("ERC1155:transfertononERC1155Receiverimplementer");\\r}\\r}\\r}',
    '{if(isContract(to)){tryIERC1155Receiver(to).onERC1155Received(operator,from,id,amount,data)returns(bytes4response){if(response!=IERC1155Receiver.onERC1155Received.selector){revert("ERC1155:ERC1155Receiverrejectedtokens");}}catchError(stringmemoryreason){revert(reason);}catch{revert("ERC1155:transfertononERC1155Receiverimplementer");}}}',
    '{if(to.isContract()){tryIERC1155Receiver(to).onERC1155Received(operator,from,id,amount,data)returns(bytes4response){if(response!=IERC1155Receiver(to).onERC1155Received.selector){revert("ERC1155:ERC1155Receiverrejectedtokens");}}catchError(stringmemoryreason){revert(reason);}catch{revert("ERC1155:transfertononERC1155Receiverimplementer");}}}',
    '{}',
    '{\\rif(to.isContract()){\\rtry\\rIERC1155Receiver(to).onERC1155Received(operator,from,id,amount,data)\\rreturns(bytes4response){\\rif(response!=IERC1155Receiver.onERC1155Received.selector){\\rrevert("ERC1155:ERC1155Receiverrejectedtokens");\\r}\\r}catchError(stringmemoryreason){\\rrevert(reason);\\r}catch{\\rrevert("ERC1155:transfertononERC1155Receiverimplementer");\\r}\\r}\\r}',
    '{require(ERC1155TokenReceiver(_to).onERC1155Received(_operator,_from,_id,_value,_data)==ERC1155_ACCEPTED,"contractreturnedanunknownvaluefromonERC1155Received");}',
    '{if(to.isContract()){tryIERC1155Receiver(to).onERC1155Received(operator,from,id,amount,data)returns(bytes4response){if(response!=IERC1155Receiver.onERC1155Received.selector){revert("ERC1155:ERC1155Receiverrejectedtokens");}}catchError(stringmemoryreason){revert(reason);}catch{revert("ERC1155:transfertonon-ERC1155Receiverimplementer");}}}',
    '{if(to.isContract()){tryIERC1155Receiver(to).onERC1155Received(operator,from,id,amount,data)returns(bytes4response){if(response!=IERC1155Receiver.onERC1155Received.selector){revert("ERC1155:ERC1155Receiverrejectedtokens");}}catchError(stringmemoryreason){revert(reason);}catch{revert("ERC1155:transfertononERC1155Receiverimplementer");}}}',
  ],
  _startTokenId: ['{}', '{returnstartTokenId;}', '{return0;}', '{return1;}'],
  _msgSenderERC721A: [
    '{}',
    '',
    '{return0;}',
    '{returnmsg.sender;}',
    '{returnmsg.sender;}',
  ],
  onERC1155Received: ['', '{returnthis.onERC1155Received.selector;}', '{}'],
  onERC721Received: ['{}', '{returnthis.onERC721Received.selector;}'],
  _spendAllowance: [
    '{uint256currentAllowance=allowance(owner,spender);if(currentAllowance!=type(uint256).max){require(currentAllowance>=amount,"ERC20:insufficientallowance");unchecked{_approve(owner,spender,currentAllowance-amount);}}}',
    '',
    '{}',
  ],
  _checkContractOnERC721Received: [
    '{tryERC721A__IERC721Receiver(to).onERC721Received(_msgSenderERC721A(),from,tokenId,_data)returns(bytes4retval){returnretval==ERC721A__IERC721Receiver(to).onERC721Received.selector;}catch(bytesmemoryreason){if(reason.length==0){_revert(TransferToNonERC721ReceiverImplementer.selector);}assembly{revert(add(32,reason),mload(reason))}}}',
    '',
    '{tryERC721A__IERC721Receiver(to).onERC721Received(_msgSenderERC721A(),from,tokenId,_data)returns(bytes4retval){returnretval==ERC721A__IERC721Receiver(to).onERC721Received.selector;}catch(bytesmemoryreason){if(reason.length==0){revertTransferToNonERC721ReceiverImplementer();}else{assembly{revert(add(32,reason),mload(reason))}}}}',
    '{tryIERC721Receiver(to).onERC721Received(_msgSender(),from,tokenId,_data)returns(bytes4retval){returnretval==IERC721Receiver(to).onERC721Received.selector;}catch(bytesmemoryreason){if(reason.length==0){revertTransferToNonERC721ReceiverImplementer();}else{assembly{revert(add(32,reason),mload(reason))}}}}',
    '{tryERC721A__IERC721Receiver(to).onERC721Received(_msgSenderERC721A(),from,tokenId,_data)returns(bytes4retval){returnretval==ERC721A__IERC721Receiver(to).onERC721Received.selector;}catch(bytesmemoryreason){if(reason.length==0){revertTransferToNonERC721ReceiverImplementer();}else{assembly{revert(add(32,reason),mload(reason))}}}}',
    '{}',
  ],
  _add: [
    '{if(!_contains(set,value)){set._values.push(value);//Thevalueisstoredatlength-1,butweadd1toallindexes//anduse0asasentinelvalueset._indexes[value]=set._values.length;returntrue;}else{returnfalse;}}',
    '',
    '{}',
    '{if(!_contains(set,value)){set._values.push(value);set._indexes[value]=set._values.length;returntrue;}else{returnfalse;}}',
  ],
  hasRole: ['{return_roles[role].members[account];}', '{}'],
  mload: ['{}', ''],
  revert: ['{}', ''],
  revertApprovalQueryForNonexistentToken: ['{}', ''],
  startTokenId: ['', '{}'],
  return_startTokenId: ['', '{}'],
  returntokenId: ['', '{}'],
  require: ['', '{}'],
  uint16: ['', '{}'],
  calldataload: ['', '{}'],
  calldatasize: ['', '{}'],
  shr: ['', '{}'],
  emitApproval: ['', '{}'],
  return_ownerOf: ['', '{}'],
  revertTransferToNonERC721ReceiverImplementer: ['{}', ''],
  IERC721Receiver: ['{}', ''],
  tryERC721A__IERC721Receiver: ['{}', ''],
  returnpayable: ['', '{}'],
  returnownershipOf: ['', '{}'],
  returnaddress: ['', '{}'],
  returns: ['', '{}'],
  decode: ['', '{}'],
  emitTransfer: ['', '{}'],
  unwrap: ['', '{}'],
  uint160: ['', '{}'],
  revertOwnerQueryForNonexistentToken: [''],
  revertUnableDetermineTokenOwner: [''],
  _tokenOwner: ['', '{}'],
  uint240: ['', '{}'],
  thendeletethelastslot: ['', '{}'],
  _isOperatable: ['', '{}'],
  transfertoaddress: ['', '{}'],
  return_add: ['', '{}'],
  payable: ['', '{}'],
  ForwarderRegistryContextBase: ['', '{}'],
  uint256: ['', '{}'],
  MapEntry: ['', '{}'],
  _afterTokenTransfer: ['', '{}'],
  return_tokenOwner: ['', '{}'],
  Clearapprovalsfromthepreviousowner_approve: ['', '{}'],
  approvalsfromthepreviousowner_approve: ['', '{}'],
  internalownerrequire: ['', '{}'],
  ownerrequire: ['', '{}'],
  elseif: ['', '{}'],
  lengthrequire: ['', '{}'],
  encodeWithSelector: ['', '{}'],
  Approval: ['', '{}'],
  shl: [''],
  address: ['', '{}'],
  has: ['', '{}'],
  _updateIDUserTotalBalance: ['', '{}'],
  gasleft: ['', '{}'],
  revertInvalidOnReceiveMsg: ['', '{}'],
  IERC1155TokenReceiver: ['', '{}'],
  Checkifrecipientiscontractif: ['', '{}'],
  emitTransferSingle: ['', '{}'],
  pop: ['', '{}'],
  SubtractBalance: ['', '{}'],
  wrap: ['', '{}'],
  push: ['', '{}'],
  type: ['', '{}'],
  uint96: ['', '{}'],
  returnhasRole: ['', '{}'],
  getPosition: ['', '{}'],
  toBalanceKey: ['', '{}'],
  tryIERC1155Receiver: ['', '{}'],
  ERC1155TokenReceiver: ['', '{}'],
  keccak256: ['', '{}'],
  assert: ['', '{}'],
  extcodehash: ['', '{}'],
  TransferSingle: ['', '{}'],
  IERC1155Receiver: ['', '{}'],
  MinterRoleGranted: ['', '{}'],
  or: [''],
  timestamp: [''],
  sload: [''],
  _extraData: ['{}'],
  catchError: ['', '{}'],
  _tokenExists: ['', '{}'],
  _tokenHasApproval: ['', '{}'],
  extcodesize: ['', '{}'],
  tryIERC721Receiver: ['{}', ''],
  ERC721A__IERC721Receiver: ['{}', ''],
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
  const tabRgex_ = /\t/g;
  const escapeSlashRegex = /\\"/g;
  const blockCommentsRegex = /\/\*[\s\S]*?\*\//g;
  const functionNamesRegex = /(function|constructor)\s+(\w+)\s*\(/;
  const spaceRegex = /\s/g;

  let sourceCode = data.data.result[0].SourceCode;
  let contractName = data.data.result[0].ContractName;
  console.log('Contract Name = ', contractName);
  if (sourceCode === '') {
    return false;
  }
  sourceCode = sourceCode
    .replace(doubleSlashCommentsRegex, '')
    .replace(blockCommentsRegex, '')
    .replace(nextLineRegex, '')
    .replace(escapeSlashRegex, '"')
    .replace(tabRgex, '')
    .replace(tabRgex_, '')
    .replace(nextLineWithDoubleSlashRegex, '');

  /**
   * if is upgradeable, return false
   */

  if (
    sourceCode.includes('Upgradeable') ||
    sourceCode.includes('upgradeable') ||
    sourceCode.includes('Proxy') ||
    sourceCode.includes('proxy')
  )
    return false;

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
