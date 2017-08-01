const jimp = require("jimp");
const rndGenerator = require("random-seed").create();
const BITS_PER_CHAR = require("./config").config.BITS_PER_CHAR;
const BITS_FOR_MESSAGE_LENGTH = require("./config").config.BITS_FOR_MESSAGE_LENGTH;

function LSBemb(imageFilename, message, key, em) {
    const sourcePath = __dirname + "/../uploads/" + imageFilename;

    jimp.read(sourcePath, function (err, image) {
        if (err) throw err;

        if(sizeEstimate(image, message, key) == false){
            em.emit("imageTooSmall");
            return;
        }

        const messageBinArr = stringToBin(message); //(length in bin format + message) -> bin format
        const amountOfBitsInMessage = messageBinArr.length;

        let n = 0;
        const colorObj = {};

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
            let count = key.fixedIntervalAmount;

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

            let count = rndGenerator.intBetween(+key.randomintervalMin, +key.randomintervalMax);

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

        image.write(__dirname + "/../result-images/" + imageFilename, function(err){
            em.emit("embedReady", imageFilename);
        });
    });
}

const embeddingMethods = {
    LSBemb: LSBemb
};

module.exports = embeddingMethods;


function sizeEstimate(image, message, key){

    const bitsAmount = message.length * BITS_PER_CHAR + BITS_FOR_MESSAGE_LENGTH;
    const pixelsAmount = image.bitmap.width * image.bitmap.height;
    let pixelsAmountNeed = 0;

    if(key.mode == "sequential"){
        pixelsAmountNeed = bitsAmount;
    }
    else if(key.mode == "fixed"){
        pixelsAmountNeed = bitsAmount * (+key.fixedIntervalAmount + 1);
    }
    else if(key.mode == "random"){
        rndGenerator.seed(key.randomintervalSeed);
        var rndSum = 0;
        for (var i = 0; i < bitsAmount; i++) {
            rndSum += rndGenerator.intBetween(+key.randomintervalMin, +key.randomintervalMax);
        }
        pixelsAmountNeed = bitsAmount + rndSum;
    }

    return pixelsAmount > pixelsAmountNeed; //if pixelsAmount > bitsAmount return true else return false
}

function stringToBin(message){
    let resultBinArr = [];

    const messageLength = message.length * BITS_PER_CHAR;
    const binMessageLength = messageLength.toString(2);
    let binMessageLengthArr = binMessageLength.split("");
    const diffLength = BITS_FOR_MESSAGE_LENGTH - binMessageLengthArr.length;
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

