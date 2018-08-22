const express = require("express");
const app = express();
const ca = require("chalk-animation");
const db = require("./sql/db.js");
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");
const s3 = require("./s3");
const config = require("./config");
const bodyParser = require("body-parser"); //this is necessary when we work with req.body

const diskStorage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, __dirname + "/uploads");
  },
  filename: function(req, file, callback) {
    uidSafe(24).then(function(uid) {
      callback(null, uid + path.extname(file.originalname));
    });
  }
});
//
const uploader = multer({
  storage: diskStorage,
  limits: {
    fileSize: 2097152
  }
});
const handleFile = uploader.single("file");

app.use(
  bodyParser.urlencoded({
    extended: false
  })
);

app.use(bodyParser.json());

app.use(express.static(__dirname + "/public"));

app.post("/upload", handleFile, s3.upload, function(req, res) {
  if (req.file) {
    db.addImage(
      config.s3Url + req.file.filename,
      req.body.username,
      req.body.title,
      req.body.description
    ).then(image => {
      res.json({
        success: true,
        image: image
      });
    });
    // res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

app.get("/comment/:id", (req, res) => {
  db.getComments(req.params.id)
    .then(comments => {
      res.json(comments);
    })
    .catch(err => console.log(err));
});

app.post("/comments", function(req, res) {
  db.addComment(req.body.image_id, req.body.username, req.body.comment).then(
    comment => {
      res.json({
        success: true,
        comment: comment
      });
    }
  );
});

app.get("/images", (req, res) => {
  db.getImages().then(data => {
    res.json(data);
  });
});

app.get("/images/:id", (req, res) => {
  db.getImagesId(req.params.id).then(image => {
    res.json(image);
  });
});

app.post("/delete/:id", (req, res) => {
  db.deleteImage(req.params.id).then(erase => {
    db.getImages()
      .then(erase => {
        res.json({
          success: true,
          images: erase
        });
      })
      .catch(err => console.log(err));
  });
});

app.get("/:lastimage", (req, res) => {
  // console.log("get last image");
  db.getMoreImages(req.params.lastimage)
    .then(images => {
      // console.log(images);
      res.json(images);
    })
    .catch(err => {
      console.log(err);
    });
});

app.listen(process.env.PORT || 8080, () =>
  ca.rainbow("listening on port 8080")
);
