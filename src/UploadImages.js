import React, {Fragment, useEffect, useState} from "react";
import "./style.css"
import * as tf from "@tensorflow/tfjs";
import {Backdrop, Chip, CircularProgress, Grid, Stack} from "@mui/material";
import Dropzone from 'react-dropzone'
import {BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip,} from 'chart.js';
import {Bar} from 'react-chartjs-2';
import axios from 'axios'


export default function UploadImages() {
    const [model, setModel] = useState(null);
    const [classLabels, setClassLabels] = useState(null);
    const [images, setImages] = useState([]);
    const [loadingModel, setLoadingModel] = useState(false)
    const [imageURLs, setImageURLs] = useState([])
    const [loading, setLoading] = useState(false);
    const [confidence, setConfidence] = useState(null);
    const [predictedClass, setPredictedClass] = useState(null);

    const [mlData, setMlData] = useState({
        labels: ["awe", "anger", "amusement", "contentment", "disgust",
        "excitement","fear", "sadness"],
        datasets: [
            {
                label: "Confidence",
                data: [0, 0, 0, 0, 0, 0, 0, 0],
                fill: true,
                backgroundColor: "rgba(6, 156,51, .3)",
                borderColor: "#02b844",
            }
        ]
    })

    const [ipData, setIpData] = useState({
        labels: ["awe", "anger", "amusement", "contentment", "disgust",
            "fear", "sadness", "excitement"],
        datasets: [
            {
                label: "Confidence",
                data: [0, 0, 0, 0, 0, 0, 0, 0],
                fill: true,
                backgroundColor: "rgba(6, 156,51, .3)",
                borderColor: "#02b844",
            }
        ]
    })


    useEffect(() => {
        const loadModel = async () => {
            setLoadingModel(true)
            setLoading(true)
            const model_url = "https://paintingemotion.s3.us-west-2.amazonaws.com/model.json";
            const model = await tf.loadLayersModel(model_url);
            setModel(model);
            setLoading(false)
            setLoadingModel(false)
        };
        const getClassLabels = async () => {
            const testLabel = ["awe", "anger", "amusement", "contentment", "disgust",
                "fear", "sadness", "excitement"]
            setClassLabels(testLabel);
        };
        loadModel();
        getClassLabels();
        if (images.length < 1) {
            return
        }
        const newImageUrls = [];
        images.forEach(image => newImageUrls.push(URL.createObjectURL(image)))
        setImageURLs(newImageUrls)
    },[images]);



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

            /* Testing api */
            let formData = new FormData();
            formData.append("file", files[0] ? files[0] : null);
            // const response = await fetch('http://127.0.0.1:5000/upload', {
            // method: 'POST',
            // body: formData})
            let response = await axios('"https://aav-processing.herokuapp.com/upload', {
                method: 'POST',
                data: formData
            })
            response = response.data 

            console.log(response)
            
            const [predictedClass, confidence] = tf.tidy(async () => {
                const tensorImg = tf.browser.fromPixels(image).resizeNearestNeighbor([120, 120]).toFloat().expandDims();
                const result = model.predict(tensorImg);
                const predictions = result.dataSync();
                const predicted_index = result.as1D().argMax().dataSync()[0];
                const predictedClass = classLabels[predicted_index];

                const test = await axios("https://aav-processing.herokuapp.com/")

                setMlData({
                    labels: ["awe", "anger", "amusement", "contentment", "disgust",
                        "fear", "sadness", "excitement"],
                    datasets: [
                        {
                            label: "Confidence",
                            data: predictions,
                            fill: true,
                            backgroundColor: "rgba(6, 156,51, .3)",
                            borderColor: "#02b844",
                        }
                    ]
                })
                setIpData({
                    labels: ["awe", "anger", "amusement", "contentment", "disgust",
                        "fear", "sadness", "excitement"],
                    datasets: [
                        {
                            label: "Confidence",
                            data: test.data.Scores,
                            fill: true,
                            backgroundColor: "rgba(6, 156,51, .3)",
                            borderColor: "#02b844",
                        }
                    ]
                })
                const confidence = Math.round(predictions[predicted_index] * 100);
                setPredictedClass(predictedClass);
                setConfidence(confidence);
                return [predictedClass, confidence];
            });

            setPredictedClass(predictedClass);
            setConfidence(confidence);
            setLoading(false);
        }
    };
    ChartJS.register(
        CategoryScale,
        LinearScale,
        BarElement,
        Title,
        Tooltip,
        Legend
    );

    const optionsML = {
        indexAxis: 'y',
        elements: {
            bar: {
                borderWidth: 1,
            },
        },
        responsive: true,
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: "CNN Model",
            },
        },
        maintainAspectRatio: true,
        margin: 0
    };

    const optionsIP = {
        indexAxis: 'y',
        elements: {
            bar: {
                borderWidth: 1,
            },
        },
        responsive: true,
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: "CSV Model",
            },
        },
        maintainAspectRatio: true,
        margin: 0
    };

    return (
        <Fragment>
            <Grid container className="App" direction="column" alignItems="center" justifyContent="center"
                  marginTop="5%">
                <Grid item>
                    <h1 style={{textAlign: "center"}}>Emotion Analyzer</h1>
                    <Dropzone multiple={false} onDrop={acceptedFiles => handleImageChange(acceptedFiles)}>
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
                        {imageURLs.map(imageSrc => <img className={"photo"} src={imageSrc} alt={"current_image"}/>)}
                    </div>
                    <text className={"center"}>CSV Chart is not real data currently! Enjoy some fake data</text>

                    <Stack style={{marginTop: "3em", width: "15rem"}} direction="row" spacing={2}>
                        <Chip
                            label={predictedClass === null ? "Prediction:" : `Prediction: ${predictedClass}`}
                            style={{justifyContent: "left"}}
                            variant="outlined"
                        />
                        <Chip
                            label={confidence === null ? "Confidence:" : `Confidence: ${confidence}%`}
                            style={{justifyContent: "left"}}
                            variant="outlined"
                        />
                    </Stack>
                </Grid>
                <div className={"center"}>
                    <div className={"chart"}>
                        <Bar options={optionsML} data={mlData}/>
                    </div>
                    <div className={"chart"}>
                        <Bar options={optionsIP} data={ipData}/>
                    </div>
                </div>

            </Grid>
            <Backdrop sx={{color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1}} open={loading}>
                {loadingModel ? "Loading Model" : "Using Model"}
                <CircularProgress color="inherit"/>
            </Backdrop>
            <text className={"center"}>AAV-Team for CS4360</text>
        </Fragment>
    );
}
