const fs = require('fs');

const AWS = require('aws-sdk');
const busboy = require('connect-busboy');
const express = require('express');
const { v4: uuidv4 } = require('uuid');

const config = require('../config.json');

const router = express.Router();

const s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  region: config.upload.region,
  accessKeyId: config.upload.accessKeyId,
  secretAccessKey: config.upload.secretAccessKey,
});

router.post('/', busboy(), (req, res) => {
  let fields = {};

  req.busboy.on('field', (fieldname, value) => {
    switch (fieldname) {
      case 'fileExt':
      case 'filePrefix':
        fields[fieldname] = value;
    }
  });

  req.busboy.on('file', (fieldname, file, filename, encoding, mimeType) => {
    const key = (fields.filePrefix || '') + uuidv4() + '.' + fields.fileExt;

    s3.upload({
      ACL: 'public-read',
      Bucket: config.upload.bucket,
      Key: config.upload.keyPrefix + key,
      Body: file,
      CacheControl: 'max-age=31536000',
      ContentType: mimeType
    }, (error, data) => {
      if (error) {
        res.status(400).send({error});
      } else {
        res.send({
          url: config.upload.baseUrl + '/' + key
        });
      }
    });
  });

  req.pipe(req.busboy);
});


module.exports = router;
