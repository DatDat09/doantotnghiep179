const faceapi = require("face-api.js");

module.exports = async function LoadModels() {
  const modelPath = __dirname + "/../model-face";
  await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
};
