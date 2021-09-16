const db = require("./models");
const fs = require("fs");
db.sequelize.sync({ force: false }).then(function () {
  //  console.log(`Sequlize connected`)
});
var tokensForAirdrop = 120000.00; //total ninjaTokens for airdrop
const recipients = [];
const amounts = [];
const limitPerTx = 5000;
async function processAirdrop() {
    var snapshots = await db.snapshot.findAll({});
    for (let i = 0; i < snapshots.length; i++) {
        if (snapshots[i].btype == 'NINJA-CAKE-LP' || snapshots[i].btype  =='CAKE-BNB-LP') { // list first farmers 
            var flag = await mapUsers(snapshots[i].address , snapshots[i].balance , parseFloat(snapshots[i].balance * 6)); // ratio 6:1
            if(flag){
                break;
            }
        } 
    }
    for (let i = 0; i < snapshots.length; i++) {
        if (snapshots[i].btype == 'CAKE') { // list users cake holders
            var flag = await mapUsers(snapshots[i].address , snapshots[i].balance , parseFloat(snapshots[i].balance * 3)); // ratio 3:1
            if(flag){
                break;
            }
        } 
    }
    // await makeBatches();
    await updateDb();
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
            fs.writeFile("./data/batch - "+batch+"-rc.json", tempRcJson, 'utf8', function (err) {
                if (err) {
                    return console.log(err);
                }
            
                console.log("The file was saved!");
            }); 
            fs.writeFile("./data/batch - "+batch+"-amount.json", tempAmountJson, 'utf8', function (err) {
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
            fs.writeFile("./data/batch - "+batch+"-rc.json", tempRcJson, 'utf8', function (err) {
                if (err) {
                    return console.log(err);
                }
            
                console.log("The file was saved!");
            }); 
            fs.writeFile("./data/batch - "+batch+"-amount.json", tempAmountJson, 'utf8', function (err) {
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
    await processAirdrop();
})()