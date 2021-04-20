const Web3 = require("web3");
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const web3 = new Web3(new Web3.providers.HttpProvider('https://bsc-dataseed.binance.org'));
const fs = require("fs");
const _ = require("lodash");
const { default: axios } = require('axios');
const contractAddress = "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82";
const async = require("async");
const abi = JSON.parse(
    fs.readFileSync("./src/ABI.json")
);
const db = require("./models");
db.sequelize.sync({ force: false }).then(function () {
    console.log(`Sequlize connected`)
});
var scanCompleted = true;
const contract = new web3.eth.Contract(abi, contractAddress);

async function scanBlocks(startBlock) {
    try {

        let tokenHolders = new Array();
        // Read all the Transfer event and Mint event to know the token holders.
        let events = await contract.getPastEvents("Transfer", {
            fromBlock: startBlock,
            toBlock: (startBlock + 10)
        });
        if (events.length > 0) {
            events.forEach(element => {
                let temp = element.returnValues;
                temp["from"] != ZERO_ADDRESS ? tokenHolders.push({address :temp["from"], block : element.blockNumber , tx: element.transactionHash}) : null;
                temp["to"] != ZERO_ADDRESS ? tokenHolders.push({address :temp["to"], block : element.blockNumber , tx: element.transactionHash}) : null;
            });
        }
        const finalHolders =  await filter(tokenHolders);
        console.log("=======writting to db=====")
        await writeDb(finalHolders);
        scanCompleted = true;
    } catch (err) {
        console.log(err)
    }
}
async function filter(holders){
    var filtered = [];
        for (let holder of holders) {
            holder.address = holder.address.toLowerCase();
            var balance = await checkBalance(holder.address)
            balance = await web3.utils.fromWei(balance, 'ether')
            var checkAddress = await isContract(holder.address)
            if(!checkAddress && Number(balance) > 0.01 &&  Number(balance) < 50) {
                console.log("New Address Found")
                console.log(holder.address)
                console.log(balance)
                holder.balance = balance;
                console.log('===============================')
                filtered.push(holder)
            }
            await delay(100);
        }
    return filtered;
}
async function writeDb(holders) {
    async.eachSeries(holders, function(item, callback) {
        db.snapshot.findOrCreate({
            where: {
              address: item.address
            },
            defaults: { // set the default properties if it doesn't exist
                address: item.address,
                balance: item.balance,
                block: item.block,
                tx: item.tx,
                status : 'unclaimed'
            }
          }).then(function(result) {
            var author = result[0], // the instance of the author
              created = result[1]; // boolean stating if it was created or not
      
            if (!created) { // false if author already exists and was not created.
              console.log('Address already exists');
            }
      
            console.log('Added new Address');
            callback();
          });
      })
}

async function delay(t) {
    return new Promise(resolve => setTimeout(resolve, t));
}
async function isContract(address) {
    const code = await web3.eth.getCode(address);
    return code !== "0x0" && code !== "0x";
}
async function checkBalance(target) {
        var bal = await contract.methods.balanceOf(target).call()
        return bal;
}
(async () => {
    while(true){
        if(scanCompleted){
            console.log("====ScanCompleted======");
            await delay(20000);
            console.log("====waited 20 sec ======");
            const currenBlock = await web3.eth.getBlockNumber();
            const lastUpdated = await db.snapshot.findOne({where: {  }, order: [['id', 'DESC' ]] })
           if(lastUpdated !== null && lastUpdated !== ''){
                console.log("==== Starting from Previous Block : "+ lastUpdated.block +" ======");
                scanCompleted = false;
                await scanBlocks(lastUpdated.block)
           } else {
            await delay(60000);
            console.log("====waited 60 sec ======");
            console.log("==== Starting from curren Block : "+ currenBlock+" ======");
            scanCompleted = false;
            await scanBlocks(currenBlock)
        }
            
        }
    }
})()