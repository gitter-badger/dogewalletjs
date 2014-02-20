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

/* OUTPUT OF THIS FILE SHOULD LOOK LIKE THIS (with different data) but "VERIFY true" shoult be the same

{ address: 'DGid2aPnJfr6nTATWwrSgeYxXoAmbDNVZP',
  privateKey: '5K4VTAMb94fWWZiMfVWyfAWZ4FVAG4essfd3D3xQxuP7vosqLqm' }
SIGN GxbwvVRnfQp3tw6puBr1EXxom/R/W8EHU+P1rE9ds74SnpisA0aXU6q2jnD5GH9csQYzQDol8suMZF9FgngJptw=
VERIFY true

*/