const db = require("../../models");
const fs = require("fs");
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('https://bsc-dataseed.binance.org'));
db.sequelize.sync({ force: false }).then(function () {
  //  console.log(`Sequlize connected`)
});
var tokensForBounty = 80000.00; //total ninjaTokens for airdrop
const recipients = [];
const amounts = [];
const limitPerTx = 5000;
async function processBounty() {
    var earnings = await db.earnings.findAll({});
    var totalPoints = 0;
    var totalEarned = 0;
    for (let i = 0; i < earnings.length; i++) {
        totalPoints = totalPoints + earnings[i].tpoints;
    }
    for (let i = 0; i < earnings.length; i++) {
        if(earnings[i].tpoints > 0){
            totalEarned  = totalEarned + (earnings[i].tpoints*tokensForBounty / totalPoints);
            var myEarn = parseFloat(earnings[i].tpoints*tokensForBounty / totalPoints);
            myEarn = web3.utils.toWei(myEarn.toString(), 'ether');
            recipients.push(earnings[i].walletId);
            amounts.push(myEarn);
        }
    }
    console.log("Total Points : " +totalPoints + " total earned : " + totalEarned);
    await makeBatches();
    // await updateDb();
}
async function mapUsers(userAddress , userBalance , reward){
    console.log("reward : ", reward , 'userBalance :  ' , userBalance);
    if(reward > tokensForAirdrop){
        reward = tokensForAirdrop;
        recipients.push(userAddress);
        amounts.push(reward.toString());
        tokensForAirdrop = tokensForAirdrop - reward;
        console.log('Almost Done !!!');
        console.log("reward : " + reward + " total ninja available : "+ tokensForAirdrop + " total users Rewarded : " + recipients.length);
        return true;
    } else {
        tokensForAirdrop = tokensForAirdrop - reward;
        recipients.push(userAddress);
        amounts.push(reward.toString());
    }
}

async function makeBatches(){
    var tempRc = [];
    var tempAmount = [];
    var batch = 1;
    for (let i = 0; i < recipients.length; i++) {
        tempRc.push(recipients[i]);
        tempAmount.push(amounts[i]);
        if(tempRc.length == 500){
 
            const tempRcJson = JSON.stringify(tempRc);
            const tempAmountJson = JSON.stringify(tempAmount);
            fs.writeFile("../../data/batch - "+batch+"-rc.json", tempRcJson, 'utf8', function (err) {
                if (err) {
                    return console.log(err);
                }
            
                console.log("The file was saved!");
            }); 
            fs.writeFile("../../data/batch - "+batch+"-amount.json", tempAmountJson, 'utf8', function (err) {
                if (err) {
                    return console.log(err);
                }
            
                console.log("The file was saved!");
            }); 
            batch++;
             tempRc = [];
             tempAmount = [];
        }
        if(i == recipients.length-1){
            console.log("final batch !!!!");
            const tempRcJson = JSON.stringify(tempRc);
            const tempAmountJson = JSON.stringify(tempAmount);
            fs.writeFile("../../data/batch - "+batch+"-rc.json", tempRcJson, 'utf8', function (err) {
                if (err) {
                    return console.log(err);
                }
            
                console.log("The file was saved!");
            }); 
            fs.writeFile("../../data/batch - "+batch+"-amount.json", tempAmountJson, 'utf8', function (err) {
                if (err) {
                    return console.log(err);
                }
            
                console.log("The file was saved!");
            }); 
          
        }
    }
}
async function updateDb(){
    for (let i = 0; i < recipients.length; i++) {
        await db.snapshot.update({ status : 'claimed'  }, { where: { address : recipients[i]  } });
    }
}
(async () => {
    await processBounty();
})()