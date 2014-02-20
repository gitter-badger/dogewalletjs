var Bitcoin = require(__dirname + "/lib/bitcoinjs.js");
var Crypto = require(__dirname + "/lib/Crypto.js").Crypto;

var key = new Bitcoin.ECKey();

var wallet = {
    address: key.getBitcoinAddress(),
    pub_hex:key.getPubKeyHex(),
    priv_hex: key.getBitcoinHexFormat(),
    priv_import: key.getBitcoinWalletImportFormat()
};

console.log(wallet);

var message = "This is just some Random Data in a String";

var sig = Bitcoin.Message.signMessage(key,message);

console.log("SIGN",sig);

//var verify = Bitcoin.Message.signMessage(wallet.address,sig,message);

//console.log("VERIFY",verify);

