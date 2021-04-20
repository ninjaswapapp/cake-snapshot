require("dotenv").config();
const { ethers } = require("hardhat");
const { BigNumber } = ethers;
const fs = require("fs");

// CMD: npx hardhat run scripts/snapshot.js
const snapshot = async (blockNum) => {
  const provider = new ethers.providers.JsonRpcProvider(
    "https://bsc-dataseed.binance.org"
  );
  const contractAddress = "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82";
  const abi = JSON.parse(
    fs.readFileSync("./src/ABI.json")
  );
  const contract = new ethers.Contract(contractAddress, abi, provider);
  let tokenHoldersFromTransferEvent = await readInvestors(contract, "Transfer");
console.log(tokenHoldersFromTransferEvent)
};

// Read all investors of the given contract address.
async function readInvestors(pairInstance, eventType) {
    let tokenHolders = new Array();
    
    // Read all the Transfer event and Mint event to know the token holders.
    let events = await pairInstance.getPastEvents(eventType, {
        fromBlock: 6662372,
        toBlock: 'latest'
    });
    if (events.length > 0 ) {
        events.forEach(element => {
            let temp = element.returnValues;
            if (eventType == "Mint") {
                tokenHolders.push(temp["sender"]);
            } else {
                temp["from"] != ZERO_ADDRESS ? tokenHolders.push(temp["from"]) : null ;
                temp["to"] != ZERO_ADDRESS ? tokenHolders.push(temp["to"]) : null ;
            }
        });
    }
    return tokenHolders;
}
const retry = async (contract, args, n) => {
  for (let i = 0; i < n; i++) {
    try {
      return await contract.queryFilter(...args);
    } catch {}
  }

  throw new Error(`Failed retrying ${n} times`);
};

snapshot(6662372)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
