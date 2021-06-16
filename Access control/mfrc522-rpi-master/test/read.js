const Mfrc522 = require("./../index");
const SoftSPI = require("rpi-softspi");
const check = require('./spreadsheetChecker');
const control = require('./controllingMachine');
const softSPI = new SoftSPI({
  clock: 23, // pin number of SCLK
  mosi: 19, // pin number of MOSI
  miso: 21, // pin number of MISO
  client: 24 // pin number of CS
});
const mfrc522 = new Mfrc522(softSPI).setResetPin(22).setBuzzerPin(18);

const loop = function (result){
  setInterval(function() {
    mfrc522.reset();
    //# Scan for cards
    let response = mfrc522.findCard();

    if (!response.status) {
      //console.log("No Card");
      control.stopMachine();
      return;
    }
    //# Get the UID of the card
    response = mfrc522.getUid();
    if (!response.status) {
      console.log("UID Scan Error");
      control.stopMachine();
      return;
    }
    //# If we have the UID, continue
    const uid = response.data;
    let UID = '' + uid[0].toString(16) + uid[1].toString(16) + uid[2].toString(16)+ uid[3].toString(16);
    
    result.users.values.forEach(Element => {
      if (Element.includes(UID)){
        console.log('succss');
        control.runMachine();
      }
    });
    //console.log(UID);

    // if (UID =="ff83aa29"){
    //   console.log("first one detected!")
    // }
  },2000)
  // console.log(result.users.values);
}

check.getDataFromSheet().then((result)=>{
  loop(result);
})