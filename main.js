const express = require("express");
const events = require("events");
const embeddingMethods = require("./server/embedding-methods");
const extractingMethods = require("./server/extracting-methods");
const webSocketServer = require("ws");
const fs = require("fs");

const app = express();
const port = 3000;
const webSocketPort = 3001;

const wss = new webSocketServer.Server({port: webSocketPort});
let wsHandler = null;
wss.on("connection", function (ws) {
    console.log("connection");
    wsHandler = ws;
});
wss.on("close", function () {
    console.log("close");
    wsHandler = null;
});

const multer = require("multer");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const destDir = "uploads/";
        fs.mkdir(destDir, function(err){
            cb(null, destDir);
        });

    },
    filename: function (req, file, cb) {

        const filePattern = /(\.png|\.bmp)$/;
        const receivedFileName = file.originalname.replace(filePattern, `-${Date.now()}$1`);

        cb(null, receivedFileName);
    }
});
const upload = multer({storage: storage});

const exphbs = require("express-handlebars");
app.engine(".hbs", exphbs(
    {
        defaultLayout: "main",
        extname: ".hbs",
        layoutsDir: __dirname + "/server/views/layouts"
    }));
app.set("view engine", ".hbs");
app.set("views", __dirname + "/server/views");

app.use("/public", express.static(__dirname + "/client"));
app.use("/emb-result", express.static(__dirname + "/result-images"));


app.get("/", function (req, res) {
   res.sendFile(__dirname + "/client/index.html");
});

app.post("/processing-page/:id", function (req, res) {
   if(req.params.id === "emb"){
       res.render("emb-extr-view", embExtrContext.embPage);
   }
   else{
       res.render("emb-extr-view", embExtrContext.extrPage);
   }
});

app.post("/path-emb", upload.single("image-file"), function (req, res, next) {
    const message = req.body["message"];
    const keyObj = createKey(req);

    const em = new events.EventEmitter();
    embeddingMethods.LSBemb(req.file.filename, message, keyObj, em);

    em.on("imageTooSmall", function(){
        res.send("Image is too small for this message and key parameters");
    });

    em.on("embedReady", function (resultImageName) {
        res.send(
            `<div class="result-content">
                <a href='/emb-result/${resultImageName}' download="image.png">Result Image File</a>
            </div>`
        );
    });
});


app.post("/path-extr", upload.single("image-file2"), function (req, res, next) {

    const keyObj = createKey(req);

    const em = new events.EventEmitter();

    extractingMethods.LSBextr(req.file.filename, keyObj, em, wsHandler);
    em.on("incorrectMessageLength", function(){
        res.send(`<div class="extracted-message-label">Bad Message Length</div>`);
    });
    em.on("extrMessageReady", function (extractedMessage) {
        res.send(`<div class="extracted-message-label">Extracted Message</div>
                  <div class="result-content">${extractedMessage}</div>`);
    });

});


app.listen(port, function () {
   console.log("app listen");
});

function createKey(req){
    const key = {};

    key.colorChannel = req.body["color-channel"];

    const intervalMode = req.body["interval-mode"]; //sequential|fixed|random

    if(intervalMode === "sequential"){
        key.mode = "sequential";
    }
    else if(intervalMode === "fixed"){
        key.mode = "fixed";
        key.fixedIntervalAmount = req.body["finterval-amount"];
    }
    else if(intervalMode === "random"){
        key.mode = "random";
        key.randomintervalMin = req.body["rinterval-min"];
        key.randomintervalMax = req.body["rinterval-max"];
        key.randomintervalSeed = req.body["rinterval-seed"];
    }

    return key;
}


const embExtrContext = {
    embPage: {
        header: "Embedding",
        actionUrl: "/path-emb",
        formId: "embed-form",
        imageInputName: "image-file",
        messageStep: true,
        resultDivId: "embedding-result-div",
        isEmbedStage: true
    },

    extrPage: {
        header: "Extracting",
        actionUrl: "/path-extr",
        formId: "extract-form",
        imageInputName: "image-file2",
        messageStep: false,
        resultDivId: "extracted-message-div",
        isExtractStage: true
    }
};