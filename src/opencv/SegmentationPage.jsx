import React from "react";
import cv from "@techstark/opencv-js";
import "./style.css";
import { semanticSegmentation } from "./semanticSegmentation";

window.cv = cv;

class SegmentationPage extends React.Component {
    constructor(props) {
        super(props);
        this.inputImgRef = React.createRef();
        this.outputImgRef = React.createRef();
        this.statusFieldRef = React.createRef();
        this.state = {
            imgUrl: "football.png",
            // imgUrl: "house.jpeg",
            isResultReady: false,
            statusText: "Detection running...",
        };
    }

    processImage(imgSrc) {
        const img = cv.imread(imgSrc);

        semanticSegmentation(img, this.outputImgRef.current, this.statusFieldRef).then(() => {
            this.setState({ isResultReady: true });
        })
        // detectFace(img, this.outputImgRef.current, this.inputImgRef.current).then(() => {
        //     this.setState({ isResultReady: true });
        // });

    }

    render() {
        const { imgUrl, isResultReady, statusText } = this.state;
        return (
            <div>
                <div style={{ marginTop: "30px" }}>
                    <span style={{ marginRight: "10px" }}>Select an image file:</span>
                    <p ref={this.statusFieldRef}>{statusText}</p>
                    <input
                        type="file"
                        name="file"
                        accept="image/*"
                        onChange={(e) => {
                            if (e.target.files[0]) {
                                this.setState({
                                    imgUrl: URL.createObjectURL(e.target.files[0]),
                                });
                            }
                        }}
                    />
                </div>

                {imgUrl && (
                    <div className="images-container">
                        <div className="image-card">
                            <div style={{ margin: "10px" }}>↓↓↓ The original image ↓↓↓</div>
                            <img
                                alt="Original input"
                                src={imgUrl}
                                onLoad={(e) => {
                                    setTimeout(async () => {
                                        this.processImage(e.target);

                                    }, 100);

                                }}
                            />
                        </div>

                        <div className="image-card">
                            <div style={{ margin: "10px" }}>
                                ↓↓↓ Detection Result ↓↓↓
                            </div>
                            {/* <canvas ref={this.outputImgRef} /> */}
                            {/* Conditionally render loading GIF or canvas */}
                            <canvas ref={this.outputImgRef} />
                            {isResultReady ? (<></>
                            ) : (
                                <img
                                    alt="Loading..."
                                    src="https://i.gifer.com/ZKZg.gif"
                                    style={{ width: "100px", height: "100px" }}
                                />)}

                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export default SegmentationPage;
