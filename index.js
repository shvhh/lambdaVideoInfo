process.env.AWS_ACCESS_KEY_ID = '...'
process.env.AWS_SECRET_ACCESS_KEY = '...'
process.env.AWS_REGION = "ap-south-1"
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const { execSync } = require("child_process"); // import { exec } from "child_process"
const s3 = new AWS.S3();
const uuid = require("uuid")



async function getFileInfo(originalFileName) {

 const params = {
  Bucket: 'test-media-hemant',
  Key: originalFileName,
 };

 s3.getObject(params, (err, { Body }) => {
  console.log(err);
  if (!err) {
   const fileName = uuid.v4() + originalFileName;
   const filePath = path.resolve(__dirname, fileName);
   fs.writeFile(path.resolve(__dirname, fileName), Body, (err, data) => {
    console.log(err);
    if (!err) {
     const videoInfo = JSON.parse(execSync(`./ffprobe -v quiet -print_format json -show_format -show_streams ${filePath}`).toString());
     const { duration, display_aspect_ratio, width, height } = videoInfo.streams.find(({ codec_type }) => codec_type === 'video');
     console.log(duration, display_aspect_ratio, width, height);
     fs.unlink(filePath, (err) => {
      console.log(err);
     })
    }
   })
  }
 })

}


getFileInfo("WildlifeWindows7SampleVideo-mid.mp4")