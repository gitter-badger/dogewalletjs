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

{ getBitcoinAddress: 'DKjd5Y8P8HpKYChZyp3HrqbpoZ3zmQPMqK',
  getExportedPrivateKey: '5J3VM5bnkLXSb5BC9LYztrmKiCRBzTiDtkJBDEYDfWfw5irZSHH' }
SIGN HOcyy273ewLrSKaWWkDvo+VebuqkXQVtAGPaD82+18iktTWjIJuIw+IkUegbA0m774jj+tqWAsN3Ud49Qvq78wU=
VERIFY true

*/