var Bitcoin = require(__dirname+"/lib/bitcoinjs.js");

var key = new Bitcoin.ECKey();

var wallet = {
    address: key.getBitcoinAddress().toString(),
    privateKey: key.getExportedPrivateKey().toString()
};

console.log(wallet);

var message = "This is just some Random Data in a String";

var sig = Bitcoin.Message.signMessage(key,message);

console.log("SIGN",sig);

var verify = Bitcoin.Message.verifyMessage(wallet.address,sig,message);

console.log("VERIFY",verify);