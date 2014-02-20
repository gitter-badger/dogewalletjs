var SecureRandom = require(__dirname + "/SecureRandom.js").SecureRandom;
var Crypto = require(__dirname + "/Crypto.js").Crypto;
var Bitcoin = require(__dirname + "/bitcoinjs.js");
var EllipticCurve = require(__dirname + "/EllipticCurve.js").EllipticCurve;
// bitaddress.org code -- though significantly modified for this implementation.
// For the original unmolested version of this code see
// https://github.com/pointbiz/bitaddress.org
(function(exports) {

    var ninja = {
        wallets: {}
    };

    ninja.privateKey = {
        isPrivateKey: function(key) {
            return (
            Bitcoin.ECKey.isWalletImportFormat(key) || Bitcoin.ECKey.isCompressedWalletImportFormat(key) || Bitcoin.ECKey.isHexFormat(key) || Bitcoin.ECKey.isBase64Format(key) || Bitcoin.ECKey.isMiniFormat(key));
        },
        getECKeyFromAdding: function(privKey1, privKey2) {
            var n = EllipticCurve.getSECCurveByName("secp256k1").getN();
            var ecKey1 = new Bitcoin.ECKey(privKey1);
            var ecKey2 = new Bitcoin.ECKey(privKey2);
            // if both keys are the same return null
            if (ecKey1.getBitcoinHexFormat() == ecKey2.getBitcoinHexFormat()) return null;
            if (ecKey1 == null || ecKey2 == null) return null;
            var combinedPrivateKey = new Bitcoin.ECKey(ecKey1.priv.add(ecKey2.priv).mod(n));
            // compressed when both keys are compressed
            if (ecKey1.compressed && ecKey2.compressed) combinedPrivateKey.setCompressed(true);
            return combinedPrivateKey;
        },
        getECKeyFromMultiplying: function(privKey1, privKey2) {
            var n = EllipticCurve.getSECCurveByName("secp256k1").getN();
            var ecKey1 = new Bitcoin.ECKey(privKey1);
            var ecKey2 = new Bitcoin.ECKey(privKey2);
            // if both keys are the same return null
            if (ecKey1.getBitcoinHexFormat() == ecKey2.getBitcoinHexFormat()) return null;
            if (ecKey1 == null || ecKey2 == null) return null;
            var combinedPrivateKey = new Bitcoin.ECKey(ecKey1.priv.multiply(ecKey2.priv).mod(n));
            // compressed when both keys are compressed
            if (ecKey1.compressed && ecKey2.compressed) combinedPrivateKey.setCompressed(true);
            return combinedPrivateKey;
        }
    };

    ninja.publicKey = {
        isPublicKeyHexFormat: function(key) {
            key = key.toString();
            return ninja.publicKey.isUncompressedPublicKeyHexFormat(key) || ninja.publicKey.isCompressedPublicKeyHexFormat(key);
        },
        // 130 characters [0-9A-F] starts with 04
        isUncompressedPublicKeyHexFormat: function(key) {
            key = key.toString();
            return /^04[A-Fa-f0-9]{128}$/.test(key);
        },
        // 66 characters [0-9A-F] starts with 02 or 03
        isCompressedPublicKeyHexFormat: function(key) {
            key = key.toString();
            return /^0[2-3][A-Fa-f0-9]{64}$/.test(key);
        },
        getBitcoinAddressFromByteArray: function(pubKeyByteArray) {
            var pubKeyHash = Bitcoin.Util.sha256ripe160(pubKeyByteArray);
            var addr = new Bitcoin.Address(pubKeyHash);
            return addr.toString();
        },
        getHexFromByteArray: function(pubKeyByteArray) {
            return Crypto.util.bytesToHex(pubKeyByteArray).toString().toUpperCase();
        },
        getByteArrayFromAdding: function(pubKeyHex1, pubKeyHex2) {
            var ecparams = EllipticCurve.getSECCurveByName("secp256k1");
            var curve = ecparams.getCurve();
            var ecPoint1 = curve.decodePointHex(pubKeyHex1);
            var ecPoint2 = curve.decodePointHex(pubKeyHex2);
            // if both points are the same return null
            if (ecPoint1.equals(ecPoint2)) return null;
            var compressed = (ecPoint1.compressed && ecPoint2.compressed);
            var pubKey = ecPoint1.add(ecPoint2).getEncoded(compressed);
            return pubKey;
        },
        getByteArrayFromMultiplying: function(pubKeyHex, ecKey) {
            var ecparams = EllipticCurve.getSECCurveByName("secp256k1");
            var ecPoint = ecparams.getCurve().decodePointHex(pubKeyHex);
            var compressed = (ecPoint.compressed && ecKey.compressed);
            // if both points are the same return null
            ecKey.setCompressed(false);
            if (ecPoint.equals(ecKey.getPubPoint())) {
                return null;
            }
            var bigInt = ecKey.priv;
            var pubKey = ecPoint.multiply(bigInt).getEncoded(compressed);
            return pubKey;
        },
        // used by unit test
        getDecompressedPubKeyHex: function(pubKeyHexComp) {
            var ecparams = EllipticCurve.getSECCurveByName("secp256k1");
            var ecPoint = ecparams.getCurve().decodePointHex(pubKeyHexComp);
            var pubByteArray = ecPoint.getEncoded(0);
            var pubHexUncompressed = ninja.publicKey.getHexFromByteArray(pubByteArray);
            return pubHexUncompressed;
        }
    };

    ninja.seeder = {
        // number of mouse movements to wait for
        seedLimit: (function() {
            var num = Crypto.util.randomBytes(12)[11];
            return 50 + Math.floor(num);
        })(),

        seedCount: 0, // counter

        // seed function exists to wait for mouse movement to add more entropy before generating an address
        seed: function(evt) {
            if (window && !evt) var evt = window.event;

            // seed a bunch (minimum seedLimit) of times based on mouse moves
            SecureRandom.seedTime();
            // seed mouse position X and Y
            if (evt) SecureRandom.seedInt((evt.clientX * evt.clientY));

            ninja.seeder.seedCount++;
            // seeding is over now we generate and display the address
            if (ninja.seeder.seedCount == ninja.seeder.seedLimit) {
                ninja.wallets.landwallet.open(); // default tab
                // UI
                document.getElementById("generate").style.display = "none";
                document.getElementById("menu").style.visibility = "visible";
            }
        },

        // If user has not moved the mouse or if they are on a mobile device
        // we will force the generation after a random period of time.
        forceGenerate: function() {
            // if the mouse has not moved enough
            if (ninja.seeder.seedCount < ninja.seeder.seedLimit) {
                SecureRandom.seedTime();
                ninja.seeder.seedCount = ninja.seeder.seedLimit - 1;
                ninja.seeder.seed();
            }
        }
    };
    
    ninja.genWallet = function(privKey) {
        var key = new Bitcoin.ECKey(privKey);
        var bitcoinAddress = key.getBitcoinAddress();
        var bitcoinPubKey = key.getPubKeyHex();
        var privateKeyWif = key.getBitcoinWalletImportFormat();
        return {
            address: bitcoinAddress,
            pub:bitcoinPubKey,
            priv: privateKeyWif
        };
    };
		
    exports.ninja = ninja;

})(module.exports);