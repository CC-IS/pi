const {getDataFromSheet} = require('./spreadsheetChecker');
const {readClass} = require('./read');
const control = require('./controllingMachine');
const devName="CCIS-HBS-001";
let access =0;
let adminUIDs =["c66759a5"];
const sheet = new getDataFromSheet();
let devNum = 0;
sheet.getDevNum(devName).then ((value)=>{devNum = value});
const read = new readClass();


const loop = function (result){
  setInterval( async function() {

    let UID = read.readCards();
    console.log('UID is: ' UID);
    if (!UID){
      control.stopMachine();
      return;
    }
    if (adminUIDs.includes(UID)){
      let time = 30;
      setInterval((interval) => {
        UID2bAdded = read.readCards();
        if (UID2bAdded|| time < 0){
          clearInterval(interval);
        }
        time-=1;
      }, 1000);
      if (UID2bAdded){
        //add it with the devNum to the sheet
        sheet.addUser(UID2bAdded,devNum);
      }
      else {
        console.log("Time over, insert admin card again.");
      }
    }
    
    let found = sheet.foundUser(result.values, UID);
    if (found[0]){
      let index = found[1];
      await sheet.getRow(index).then((result)=>{
             access = (result.sheet.values[0][devNum]);
            })
    }
    else {
      control.stopMachine();
      return;
    }
    
    if (access==1){
      control.runMachine();
    }
    else{
      control.stopMachine();
    }
  },1000)
}

sheet.getUsers().then((result)=>{
  loop(result.data);
})
