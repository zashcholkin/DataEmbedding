var express = require("express");
var jimp = require("jimp");

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
app.use(express.static(__dirname + "/libraryes"));


app.get("/", function (req, res) {
   res.sendFile(__dirname + "/index.html")
});

app.post("/path1", upload.single("image-file"), function (req, res, next) {
   jimp.read(__dirname + "/uploads/" + req.file.originalname, function (err, image) {
       if (err) throw err;

       for (var i = 0; i < image.bitmap.width; i++)
           for (var j = 0; j < image.bitmap.height; j++){
               var color = image.getPixelColor(i, j);
               var Red = jimp.intToRGBA(color).r;
               var newColor = jimp.rgbaToInt(Red, 0, 0, 255);

               image.setPixelColor(newColor, i,j);
           }
           image.write(__dirname + "/result-images/" + req.file.originalname);

       res.send("Result image is ready")
   });
});

app.listen(3000, function () {
   console.log("app listen");
});