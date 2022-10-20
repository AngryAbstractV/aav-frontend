import React, {useState, useEffect, Fragment} from "react";
import "./style.css"
import * as tf from "@tensorflow/tfjs";
import {Backdrop, Chip, CircularProgress, Grid, Stack} from "@mui/material";
import Dropzone from 'react-dropzone'



export default function UploadImages() {
    const [model, setModel] = useState(null);
    const [classLabels, setClassLabels] = useState(null);
    const [images, setImages] = useState([]);


    useEffect(() => {
        const loadModel = async () => {
            const model_url = "https://paintingemotion.s3.us-west-2.amazonaws.com/model.json";
            const model = await tf.loadLayersModel(model_url);
            setModel(model);
        };
        const getClassLabels = async () => {
            const testLabel = ["awe", "anger", "amusement", "contentment", "disgust",
                "fear", "sadness", "excitement"]
            setClassLabels(testLabel);
        };
        loadModel();
        getClassLabels();
        if (images.length < 1){
            return
        }
        const newImageUrls = [];
        images.forEach(image => newImageUrls.push(URL.createObjectURL(image)))
        setImageURLs(newImageUrls)
    }, [images]);



    const [imageURLs, setImageURLs] = useState([])
    const [loading, setLoading] = useState(false);
    const [confidence, setConfidence] = useState(null);
    const [predictedClass, setPredictedClass] = useState(null);


    const readImageFile = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
        });
    };


    const createHTMLImageElement = (imageSrc) => {
        return new Promise((resolve) => {
            const img = new Image();

            img.onload = () => resolve(img);

            img.src = imageSrc;
        });
    };


    const handleImageChange = async (files) => {
        if (files.length === 0) {
            setConfidence(null);
            setPredictedClass(null);
        }
        if (files.length === 1) {
            setImages(files)
            setLoading(true);
            const imageSrc = await readImageFile(files[0]);
            const image = await createHTMLImageElement(imageSrc);
            const [predictedClass, confidence] = tf.tidy(() => {
                const tensorImg = tf.browser.fromPixels(image).resizeNearestNeighbor([120, 120]).toFloat().expandDims();
                const result = model.predict(tensorImg);
                const predictions = result.dataSync();
                const predicted_index = result.as1D().argMax().dataSync()[0];
                const predictedClass = classLabels[predicted_index];
                console.log(predictions)
                console.log(predicted_index)
                const confidence = Math.round(predictions[predicted_index] * 100);
                return [predictedClass, confidence];
            });
            setPredictedClass(predictedClass);
            setConfidence(confidence);
            setLoading(false);
        }
    };


    return (
        <Fragment>
            <Grid container className="App" direction="column" alignItems="center" justifyContent="center" marginTop="12%">
                <Grid item>
                    <h1 style={{ textAlign: "center", marginBottom: "1.5em" }}>Emotion Analyzer</h1>
                    <Dropzone  multiple={false} onDrop={acceptedFiles => handleImageChange(acceptedFiles)}>
                        {({getRootProps, getInputProps}) => (
                            <section>
                                <div {...getRootProps()}>
                                    <input {...getInputProps()} />
                                    <p className={'fileDrop'}>Drop or click to input an image</p>
                                </div>
                            </section>
                        )}
                    </Dropzone>
                    <div>
                        { imageURLs.map(imageSrc => <img className={"photo"} src={imageSrc}  alt={"current_image"}/>)}
                    </div>
                    <Stack style={{ marginTop: "2em", width: "12rem" }} direction="row" spacing={1}>
                        <Chip
                            label={predictedClass === null ? "Prediction:" : `Prediction: ${predictedClass}`}
                            style={{ justifyContent: "left" }}
                            variant="outlined"
                        />
                        <Chip
                            label={confidence === null ? "Confidence:" : `Confidence: ${confidence}%`}
                            style={{ justifyContent: "left" }}
                            variant="outlined"
                        />
                    </Stack>
                </Grid>
            </Grid>
            <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </Fragment>
    );
}
