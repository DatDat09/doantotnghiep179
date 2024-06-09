const canvas = require("canvas");
const faceapi = require("face-api.js");
const User = require("../models/user");
const ClassExam = require("../models/classExam");
const fs = require('fs');
const mongoose = require('mongoose'); // Import mongoose để dùng ObjectId
const { Canvas, Image } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image });
// const User = require('../models/user')

const loadModels = require("../models/modelLoader");
loadModels();

async function getDescriptorsFromDB(image) {
  try {
    let users = await User.find({ description: { $exists: true, $not: { $size: 0 } } });
    if (!users.length) {
      throw new Error("No faces found in the database.");
    }

    const labeledFaceDescriptors = users.map(user => {
      // const userName = user.name;
      const descriptions = user.description.map(desc => new Float32Array(Object.values(desc)));
      return new faceapi.LabeledFaceDescriptors(user._id.toString(), descriptions); // Sử dụng user._id làm label
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
    return results;
  } catch (error) {
    console.error("Error in getDescriptorsFromDB:", error.message);
    throw error;
  }
}

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

    const result = await getDescriptorsFromDB(File1.tempFilePath);
    const matchedUser = result[0];
    // console.log("resultCon:", result[0]._label)

    if (matchedUser.label !== 'unknown') {
      const userId = mongoose.Types.ObjectId(matchedUser.label); // Chuyển đổi label thành ObjectId
      if (!classExam.idStudentsDiemDanh.includes(userId)) {
        classExam.idStudentsDiemDanh.push(userId);
        await classExam.save();
      }
      // res.json({ message: "Attendance recorded successfully", matchedUser });
    }
    res.json({ result });

  } catch (error) {
    console.error("Error in checkFaceByClassExam:", error.message);
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
};
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
