const canvas = require("canvas");
const faceapi = require("face-api.js");
const User = require("../models/user");
const ClassExam = require("../models/classExam");
const fs = require('fs');
const mongoose = require('mongoose'); // Import mongoose để dùng ObjectId
const { Canvas, Image } = canvas;
const { v4: uuidv4 } = require('uuid'); // Import uuid để tạo định danh duy nhất

faceapi.env.monkeyPatch({ Canvas, Image });
// const User = require('../models/user')

const loadModels = require("../models/modelLoader");
loadModels();

const path = require('path');

async function drawAndSaveImage(imagePath, detections, results) {
  try {
    const img = await canvas.loadImage(imagePath);
    const out = canvas.createCanvas(img.width, img.height);
    const ctx = out.getContext('2d');

    ctx.drawImage(img, 0, 0, img.width, img.height);

    for (let i = 0; i < detections.length; i++) {
      const detection = detections[i];
      const { box } = detection.detection;
      const bestMatch = results[i];
      let label = 'undefined';

      if (bestMatch.label !== 'unknown') {
        const userId = mongoose.Types.ObjectId(bestMatch.label);
        const user = await User.findById(userId);
        if (user) {
          label = `${user.name}: ${user.mssv}`;
        }
        ctx.strokeStyle = 'green';
      } else {
        ctx.strokeStyle = 'red';
      }

      ctx.lineWidth = 7;
      ctx.strokeRect(box.x, box.y, box.width, box.height);

      // Dynamically adjust font size
      let fontSize = 40; // Initial font size
      ctx.font = `${fontSize}px Arial`;
      let textWidth = ctx.measureText(label).width;
      while (textWidth > box.width && fontSize > 10) { // Ensure the text fits within the box width and the font size is reasonable
        fontSize -= 1;
        ctx.font = `${fontSize}px Arial`;
        textWidth = ctx.measureText(label).width;
      }

      // Draw text below the bounding box
      ctx.fillStyle = ctx.strokeStyle;
      ctx.fillText(label, box.x, box.y + box.height + fontSize + 5);
    }

    const uniqueFilename = uuidv4() + '.jpg';
    const outputPath = path.join(__dirname, '../public/images/upload', uniqueFilename);
    const outStream = fs.createWriteStream(outputPath);
    const stream = out.createJPEGStream();

    stream.pipe(outStream);
    return new Promise((resolve, reject) => {
      outStream.on('finish', () => resolve(outputPath));
      outStream.on('error', reject);
    });
  } catch (error) {
    console.error("Error in drawAndSaveImage:", error.message);
    throw error;
  }
}




async function getDescriptorsFromDB(image) {
  try {
    let users = await User.find({ description: { $exists: true, $not: { $size: 0 } } });
    if (!users.length) {
      throw new Error("No faces found in the database.");
    }

    const labeledFaceDescriptors = users.map(user => {
      const descriptions = user.description.map(desc => new Float32Array(Object.values(desc)));
      return new faceapi.LabeledFaceDescriptors(user._id.toString(), descriptions);
    });

    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.45);
    const img = await canvas.loadImage(image);
    const displaySize = { width: img.width, height: img.height };

    const detections = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors();
    if (!detections.length) {
      throw new Error("No faces detected in the provided image.");
    }

    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor));

    const outputImagePath = await drawAndSaveImage(image, resizedDetections, results);
    return { results, outputImagePath };
  } catch (error) {
    console.error("Error in getDescriptorsFromDB:", error.message);
    throw error;
  }
}

exports.checkFaceByClassExam = async (req, res) => {
  try {
    const { File1 } = req.files;
    const { idClassExam } = req.params;

    if (!File1) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const classExam = await ClassExam.findById(idClassExam);
    if (!classExam) {
      return res.status(404).json({ message: "Class exam not found" });
    }

    const { results, outputImagePath } = await getDescriptorsFromDB(File1.tempFilePath);
    console.log("Number of faces detected:", results.length);

    const recognizedUsers = [];
    let unrecognizedCount = 0;

    for (const matchedUser of results) {
      if (matchedUser.label !== 'unknown') {
        const userId = mongoose.Types.ObjectId(matchedUser.label);
        if (!classExam.idStudentsDiemDanh.includes(userId)) {
          classExam.idStudentsDiemDanh.push(userId);
        }
        const user = await User.findById(userId);
        recognizedUsers.push({
          name: user.name,
          mssv: user.mssv,
          distance: matchedUser.distance,
          recognized: true
        });
      } else {
        unrecognizedCount++;
      }
    }

    await classExam.save();
    console.log("Recognized Users: ", recognizedUsers);

    res.json({ recognizedUsers, unrecognizedCount, outputImagePath });
  } catch (error) {
    console.error("Error in checkFaceByClassExam:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};




async function uploadLabeledImages(images, userId) {
  try {
    const descriptions = [];
    for (const imgPath of images) {
      if (!fs.existsSync(imgPath)) {
        throw new Error(`File not found: ${imgPath}`);
      }
      const img = await canvas.loadImage(imgPath);
      const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
      if (!detection) {
        throw new Error(`No faces detected in image.`);
      }
      descriptions.push(detection.descriptor);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    user.description = descriptions;
    await user.save();
    return true;
  } catch (error) {
    console.error("Error in uploadLabeledImages:", error.message);
    return error;
  }
}

exports.postFace = async (req, res) => {
  try {
    const { File1 } = req.files;
    const { userId } = req.body;
    if (!File1) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const result = await uploadLabeledImages([File1.tempFilePath], userId);
    if (result === true) {
      res.json({ message: "Face data stored successfully" });
    } else {
      res.status(500).json({ message: "Something went wrong, please try again." });
    }
  } catch (error) {
    console.error("Error in postFace:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.checkFace = async (req, res) => {
  try {
    const { File1 } = req.files;
    if (!File1) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const result = await getDescriptorsFromDB(File1.tempFilePath);

    res.json({ result });
  } catch (error) {
    console.error("Error in checkFace:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};




exports.renderForm = async (req, res) => {
  try {
    const { idClassExam } = req.params;
    const classExam = await ClassExam.findById(idClassExam);

    res.render('build/pages/faceCheck', { idClassExam, classExam });
  } catch (error) {
    console.error("Error in renderForm:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.getFaceByName = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (user) {
      res.json({ name: user.name });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error in fetching recognized name:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}




exports.renderForm1 = async (req, res) => {
  try {
    const { idClassExam } = req.params;
    const classExam = await ClassExam.findById(idClassExam);

    res.render('build/teacher/faceCkeckofTeacher', { idClassExam, classExam });
  } catch (error) {
    console.error("Error in renderForm:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}
