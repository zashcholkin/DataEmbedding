const jimp = require("jimp");
const rndGenerator = require("random-seed").create();
const BITS_PER_CHAR = require("./config").config.BITS_PER_CHAR;
const BITS_FOR_MESSAGE_LENGTH = require("./config").config.BITS_FOR_MESSAGE_LENGTH;

function LSBextr(imageFilename, key, em) {
    const sourcePath = __dirname + "/../uploads/" + imageFilename;

    const messageBinArr = [];

    jimp.read(sourcePath, function (err, image) {
        if (err) throw err;

        const binMessageLengthArr = [];
        let messageLengthReady = false;

        if(key.mode == "sequential") {
            outer:
                for (var i = 0; i < image.bitmap.width; i++)
                    for (var j = 0; j < image.bitmap.height; j++) {
                        var color = image.getPixelColor(i, j);
                        var workChannelValue = jimp.intToRGBA(color)[key.colorChannel];

                        var lowBit = workChannelValue & 1;

                        if (messageLengthReady == false) {
                            binMessageLengthArr.push(lowBit);
                            if (binMessageLengthArr.length == BITS_FOR_MESSAGE_LENGTH) {
                                var binLength = binMessageLengthArr.join("");
                                var messageLength = parseInt(binLength, 2);
                                messageLengthReady = true;
                            }
                        }
                        else {
                            messageBinArr.push(lowBit);
                            if (messageBinArr.length == messageLength) {
                                break outer;
                            }
                        }
                    }
        }
        else if(key.mode == "fixed"){
            let count = key.fixedIntervalAmount;

            outer:
                for (var i = 0; i < image.bitmap.width; i++)
                    for (var j = 0; j < image.bitmap.height; j++) {
                        if (count != 0) {
                            count--
                        }
                        else {
                            count = key.fixedIntervalAmount;

                            var color = image.getPixelColor(i, j);
                            var workChannelValue = jimp.intToRGBA(color)[key.colorChannel];

                            var lowBit = workChannelValue & 1;

                            if (messageLengthReady == false) {
                                binMessageLengthArr.push(lowBit);
                                if (binMessageLengthArr.length == BITS_FOR_MESSAGE_LENGTH) {
                                    var binLength = binMessageLengthArr.join("");
                                    var messageLength = parseInt(binLength, 2);
                                    messageLengthReady = true;
                                }
                            }
                            else {
                                messageBinArr.push(lowBit);
                                if (messageBinArr.length == messageLength) {
                                    break outer;
                                }
                            }
                        }
                    }
        }
        else if(key.mode == "random"){
            rndGenerator.seed(key.randomintervalSeed);
            let count = rndGenerator.intBetween(+key.randomintervalMin, +key.randomintervalMax);

            outer:
                for (var i = 0; i < image.bitmap.width; i++)
                    for (var j = 0; j < image.bitmap.height; j++) {
                        if (count != 0) {
                            count--
                        }
                        else {
                            count = rndGenerator.intBetween(+key.randomintervalMin, +key.randomintervalMax);

                            var color = image.getPixelColor(i, j);
                            var workChannelValue = jimp.intToRGBA(color)[key.colorChannel];

                            var lowBit = workChannelValue & 1;

                            if (messageLengthReady == false) {
                                binMessageLengthArr.push(lowBit);
                                if (binMessageLengthArr.length == BITS_FOR_MESSAGE_LENGTH) {
                                    var binLength = binMessageLengthArr.join("");
                                    var messageLength = parseInt(binLength, 2);
                                    messageLengthReady = true;
                                }
                            }
                            else {
                                messageBinArr.push(lowBit);
                                if (messageBinArr.length == messageLength) {
                                    break outer;
                                }
                            }
                        }
                    }
        }

        let binCharArr = [];
        const resultTextArr = [];

        while(messageBinArr.length > 0){
            binCharArr = messageBinArr.splice(0, BITS_PER_CHAR);
            var binChar = binCharArr.join("");
            var char = parseInt(binChar, 2);
            resultTextArr.push(String.fromCharCode(char));
        }

        em.emit("extrMessageReady", resultTextArr.join(""));
    });
}

const extractingMethods = {
    LSBextr: LSBextr
};

module.exports = extractingMethods;