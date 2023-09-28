import cv from "@techstark/opencv-js";

async function loadDataFile(cvFileName) {
  // see https://docs.opencv.org/master/utils.js
  try {
    let filePath = "models/" + cvFileName;
    console.log(filePath)
    const response = await fetch(filePath);
    const buffer = await response.arrayBuffer();
    const data = new Uint8Array(buffer);
    cv.FS_createDataFile("/", cvFileName, data, true, false, false);
  } catch (error) {
    console.error(`Model file load failed: ${error}`);
  }
}

export default async function loadDnnModel(modelFiles) {
  // This function loads deep neural net model files from the webpage's public/models/ folder and returns an OpenCV net object.
  // Input can be file name as string or an array of such.
  modelFiles = typeof modelFiles === "string" ? [modelFiles] : modelFiles;

  for (let fileName of modelFiles) {
    await loadDataFile(fileName);
  }
  let net = cv.readNet(...modelFiles);
  return net;
}

