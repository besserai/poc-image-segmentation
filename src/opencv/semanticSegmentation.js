import cv from "@techstark/opencv-js";
import loadDnnModel from "./loadDnnModel";


const inputSize = [513, 513];
const mean = [127.5, 127.5, 127.5];
const std = 0.007843;
const swapRB = false;
const modelFiles = "opt_deeplabv3_mnv2_513.pb"
// const modelFiles = ["skyfinder_ensemble.caffemodel", "skyfinder_deploy.net"]
// "skyfinder_solver.prototxt"

export async function semanticSegmentation(img, drawingTarget, statusFieldRef) {
    // img = cv.Mat
    try {
        const input = getBlobFromImage(inputSize, mean, std, swapRB, img);
        let net = await loadDnnModel(modelFiles);
        console.log(`Model loaded: ${net}`);
        net.setInput(input);
        const start = performance.now();
        const result = net.forward();
        const time = performance.now() - start;
        const colors = generateColors(result);
        const output = argmax(result, colors);

        updateResult(output, time, drawingTarget, statusFieldRef);
        input.delete();
        net.delete();
        result.delete();
    } catch (error) {
        console.log(error)
        console.error(`Error in semanticSegmentation"${error}`)
    }
}


function updateResult(output, time, drawingTarget, statusFieldRef) {
    try {
        // let canvasOutput = document.getElementById(drawingTarget);
        drawingTarget.style.visibility = "visible";
        cv.imshow(drawingTarget, output);
        statusFieldRef.current.innerText = `Inference time: ${time.toFixed(2)} ms`;
    } catch (e) {
        console.log(e);
    }
}

const getBlobFromImage = function (inputSize, mean, std, swapRB, mat) {

    let matC3 = new cv.Mat(mat.matSize[0], mat.matSize[1], cv.CV_8UC3);
    cv.cvtColor(mat, matC3, cv.COLOR_RGBA2BGR);
    let input = cv.blobFromImage(matC3, std, new cv.Size(inputSize[0], inputSize[1]),
        new cv.Scalar(mean[0], mean[1], mean[2]), swapRB);

    matC3.delete();
    return input;
}

const generateColors = function (result) {
    const numClasses = result.matSize[1];
    let colors = [0, 0, 0];
    while (colors.length < numClasses * 3) {
        colors.push(Math.round((Math.random() * 255 + colors[colors.length - 3]) / 2));
    }
    return colors;
}

const argmax = function (result, colors) {
    const C = result.matSize[1];
    const H = result.matSize[2];
    const W = result.matSize[3];
    const resultData = result.data32F;
    const imgSize = H * W;

    let classId = [];
    for (let i = 0; i < imgSize; ++i) {
        let id = 0;
        for (let j = 0; j < C; ++j) {
            if (resultData[j * imgSize + i] > resultData[id * imgSize + i]) {
                id = j;
            }
        }
        classId.push(colors[id * 3]);
        classId.push(colors[id * 3 + 1]);
        classId.push(colors[id * 3 + 2]);
        classId.push(255);
    }

    let output = cv.matFromArray(H, W, cv.CV_8UC4, classId);
    return output;
}