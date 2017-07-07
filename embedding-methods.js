var jimp = require("jimp");
var rndGenerator = require("random-seed").create();
const BITS_PER_CHAR = require("./config").config.BITS_PER_CHAR;
const BITS_FOR_MESSAGE_LENGTH = require("./config").config.BITS_FOR_MESSAGE_LENGTH;

function LSBemb(imageFilename, message, key, em) {
    var sourcePath = __dirname + "/uploads/" + imageFilename;

    jimp.read(sourcePath, function (err, image) {
        if (err) throw err;

        if(sizeEstimate(image, message) == false){
            em.emit("imageTooSmall");
            return;
        }

        var messageBinArr = stringToBin(message); //(length in bin format + message) -> bin format
        var amountOfBitsInMessage = messageBinArr.length;

        var n = 0;
        var colorObj = {};

        if(key.mode == "sequential") {
            outer:
            for (var i = 0; i < image.bitmap.width; i++)
                for (var j = 0; j < image.bitmap.height; j++) {

                if(amountOfBitsInMessage == n){
                    break outer;
                }

                    var color = image.getPixelColor(i, j);
                    colorObj.r = jimp.intToRGBA(color).r;
                    colorObj.g = jimp.intToRGBA(color).g;
                    colorObj.b = jimp.intToRGBA(color).b;

                    var workChannelValue = jimp.intToRGBA(color)[key.colorChannel];
                    var resultWorkChannelValue = embed(workChannelValue, messageBinArr[n]);
                    colorObj[key.colorChannel] = resultWorkChannelValue;

                    var newColor = jimp.rgbaToInt(colorObj.r, colorObj.g, colorObj.b, 255);

                    image.setPixelColor(newColor, i, j);

                    n++;
                }
        }
        else if(key.mode == "fixed"){
            var count = key.fixedIntervalAmount;

            outerFixed:
            for (var i = 0; i < image.bitmap.width; i++)
                for (var j = 0; j < image.bitmap.height; j++) {

                    if(amountOfBitsInMessage == n){
                        break outerFixed;
                    }

                    if (count != 0) {
                        count--;
                    }
                    else {
                        count = key.fixedIntervalAmount;

                        var color = image.getPixelColor(i, j);
                        colorObj.r = jimp.intToRGBA(color).r;
                        colorObj.g = jimp.intToRGBA(color).g;
                        colorObj.b = jimp.intToRGBA(color).b;

                        var workChannelValue = jimp.intToRGBA(color)[key.colorChannel];
                        var resultWorkChannelValue = embed(workChannelValue, messageBinArr[n]);
                        colorObj[key.colorChannel] = resultWorkChannelValue;

                        var newColor = jimp.rgbaToInt(colorObj.r, colorObj.g, colorObj.b, 255);

                        image.setPixelColor(newColor, i, j);

                        n++;
                    }
                }
        }
        else if(key.mode == "random"){
            rndGenerator.seed(key.randomintervalSeed);

            var count = rndGenerator.intBetween(+key.randomintervalMin, +key.randomintervalMax);

            outerRandom:
            for (var i = 0; i < image.bitmap.width; i++)
                for (var j = 0; j < image.bitmap.height; j++) {

                    if(amountOfBitsInMessage == n){
                        break outerRandom;
                    }

                    if (count != 0) {
                        count--;
                    }
                    else {
                        count = rndGenerator.intBetween(+key.randomintervalMin, +key.randomintervalMax);

                        var color = image.getPixelColor(i, j);
                        colorObj.r = jimp.intToRGBA(color).r;
                        colorObj.g = jimp.intToRGBA(color).g;
                        colorObj.b = jimp.intToRGBA(color).b;

                        var workChannelValue = jimp.intToRGBA(color)[key.colorChannel];
                        var resultWorkChannelValue = embed(workChannelValue, messageBinArr[n]);
                        colorObj[key.colorChannel] = resultWorkChannelValue;

                        var newColor = jimp.rgbaToInt(colorObj.r, colorObj.g, colorObj.b, 255);

                        image.setPixelColor(newColor, i, j);

                        n++;
                    }
                }

        }

        image.write(__dirname + "/result-images/" + imageFilename, function(err){
            em.emit("embedReady", imageFilename);
        });
    });
}
var embeddingMethods = {
    LSBemb: LSBemb
};

module.exports = embeddingMethods;


function sizeEstimate(image, message){

    var pixelsAmount = image.bitmap.width * image.bitmap.height;
    var bitsAmount = message.length * BITS_PER_CHAR + BITS_FOR_MESSAGE_LENGTH;

    return pixelsAmount > bitsAmount; //if pixelsAmount > bitsAmount return true else return false
}

function stringToBin(message){
    var resultBinArr = [];

    var messageLength = message.length * BITS_PER_CHAR;
    var binMessageLength = messageLength.toString(2);
    var binMessageLengthArr = binMessageLength.split("");
    var diffLength = BITS_FOR_MESSAGE_LENGTH - binMessageLengthArr.length;
    if(diffLength > 0){
        binMessageLengthArr = (Array(diffLength).fill(0)).concat(binMessageLengthArr); //[1010] -> [0000..00 1010]
    }
    else{
        throw "Message too large for parameter BITS_FOR_MESSAGE_LENGTH";
    }

    resultBinArr = resultBinArr.concat(binMessageLengthArr);

    for (var i = 0; i < message.length; i++) {
        var char = message.charCodeAt(i);
        var binChar = char.toString(2);
        var binCharArr = binChar.split("");

        var diff = BITS_PER_CHAR - binCharArr.length;

        if (diff != 0) {
            binCharArr = (Array(diff).fill(0)).concat(binCharArr); //[1,0,1,0] -> [0,0,0, 1,0,1,0]
        }
        resultBinArr = resultBinArr.concat(binCharArr);
    }

    return resultBinArr;
}


//embed stegoBit in sourceByte on Low Position
function embed(sourceByte, stegoBit){

    if ((sourceByte & 1) == stegoBit){ //if low bit in sourceByte and stegoBit are equal
        return sourceByte;
    }

    return sourceByte ^ 1; //invert low bit
}

