var express = require("express");
var events = require("events");
var embeddingMethods = require("./embedding-methods");
var extractingMethods = require("./extracting-methods");

var app = express();

var multer = require("multer");
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/")
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
var upload = multer({storage: storage});

app.use(express.static(__dirname + "/css"));
app.use(express.static(__dirname + "/libraries"));
app.use(express.static(__dirname + "/result-images"));


app.get("/", function (req, res) {
   res.sendFile(__dirname + "/index.html")
});

app.post("/path-emb", upload.single("image-file"), function (req, res, next) {

    var message = req.body["message"];
    var keyObj = createKey(req);

    var em = new events.EventEmitter();
    embeddingMethods.LSBemb(req.file.originalname, message, keyObj, em);

    em.on("imageTooSmall", function(){
        res.send("Image is too small for this message");
    });

    em.on("embedReady", function (resultImageName) {
        res.send(`<a href='${resultImageName}' download="image.png">Result File</a>` );
    });
});


app.post("/path-extr", upload.single("image-file2"), function (req, res, next) {

    //var colorChannel = req.body["color-channel-extr"];
    var keyObj = createKey(req);

    var em = new events.EventEmitter();
    extractingMethods.LSBextr(req.file.originalname, keyObj, em);
    em.on("extrMessageReady", function (extractedMessage) {
        res.send(`<div>${extractedMessage}</div>`);
    });

});


app.listen(3000, function () {
   console.log("app listen");
});

function createKey(req){
    var key = {};

    key.colorChannel = req.body["color-channel"];

    var intervalMode = req.body["interval-mode"]; //sequential|fixed|random

    if(intervalMode == "sequential"){
        key.mode = "sequential";
    }
    else if(intervalMode == "fixed"){
        key.mode = "fixed";
        key.fixedIntervalAmount = req.body["finterval-amount"];
    }
    else if(intervalMode == "random"){
        key.mode = "random";
        key.randomintervalMin = req.body["rinterval-min"];
        key.randomintervalMax = req.body["rinterval-max"];
        key.randomintervalSeed = req.body["rinterval-seed"];
    }

    return key;
}