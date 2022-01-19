const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const { execSync } = require("child_process");
const s3 = new AWS.S3();
const uuid = require("uuid")

exports.handler = async (event) => {
 // TODO implement


 const response = {
  statusCode: 200,
  body: await getFileInfo("WildlifeWindows7SampleVideo-high.mp4"),
 };
 return response;
};

async function getFileInfo(originalFileName) {
 return new Promise((resolve, reject) => {
  const params = {
   Bucket: 'bp-social-post-test',
   Key: originalFileName,
  };

  console.log('ffprob', fs.existsSync("/opt/nodejs/ffprobe"))

  s3.getObject(params, (err, { Body }) => {
   console.log(err);
   if (!err) {
    const fileName = uuid.v4() + originalFileName;
    const __dirname = '/tmp';
    const filePath = path.resolve(__dirname, fileName);
    fs.writeFile(path.resolve(__dirname, fileName), Body, (err, data) => {
     console.log(err);
     if (!err) {
      const videoInfo = JSON.parse(execSync(`/opt/nodejs/ffprobe -v quiet -print_format json -show_format -show_streams ${filePath}`).toString());
      const { duration, display_aspect_ratio, width, height } = videoInfo.streams.find(({ codec_type }) => codec_type === 'video');
      resolve({ duration, display_aspect_ratio, width, height });
      fs.unlink(filePath, (err) => {
       console.log(err);
      })
     }
    })
   }
  })
 })


}
