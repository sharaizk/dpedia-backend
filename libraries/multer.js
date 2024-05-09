const aws = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3')

const s3 = new aws.S3({
    apiVersion: process.env.API_VERSION,
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION,
});

const fileFilter = (req, file, cb) => {
  cb(
    file.mimetype === "image/jpeg" || file.mimetype === "image/png"
      ? (null, true)
      : new Error("Only Image Uploads are accepted")
  );
};

exports.uploadS3 = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.BUCKET,
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, {
        fieldName: file.field,
      });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + file.originalname);
    },
  }),
});
exports.uploadBase64 = (fileName,base64file,imageIndex) => {
  const base64Data = new Buffer.from(
    base64file.replace(/^data:image\/\w+;base64,/, ""),
    "base64"
  );
  const type = base64file.split(";")[0].split("/")[1];
  const uploadParams = {
    Bucket: process.env.BUCKET,
    Body: base64Data,
    Key: `${fileName.replace('.docx','')}-${imageIndex+1}.png`,
    ContentEncoding: "base64",
    ContentType: `image/png`,
  };
  return s3.upload(uploadParams).promise();
};
