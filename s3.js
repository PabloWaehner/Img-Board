const knox = require("knox");
const fs = require("fs");

let secrets;
if (process.env.NODE_ENV == "production") {
    secrets = process.env; // in prod the secrets are environment variables
} else {
    secrets = require("./secrets"); // secrets.json is in .gitignore
}

const client = knox.createClient({
    key: secrets.AWS_KEY,
    secret: secrets.AWS_SECRET,
    bucket: "spicedling" //the name of the bucket
});

exports.upload = function(req, res, next) {
    if (!req.file) {
        return res.json({
            error: true
        });
    }
    const s3Request = client.put(req.file.filename, {
        "Content-Type": req.file.mimetype,
        "Content-Length": req.file.size,
        "x-amz-acl": "public-read" //to make it accesible to whoever wants to see it
    });
    const readStream = fs.createReadStream(req.file.path);
    readStream.pipe(s3Request);
    s3Request.on("response", s3Response => {
        console.log("s3Response.statusCode: ", s3Response.statusCode);
        if (s3Response.statusCode == 200) {
            next();
            // fs.unlink(req.file.path, () => {}); in case we want to delete an image
        } else {
            res.json({
                error: true
            });
        }
    });
};
