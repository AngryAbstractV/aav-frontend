import React, {Fragment, useEffect, useState} from "react";
import "./style.css"
import * as tf from "@tensorflow/tfjs";
import {Backdrop, Chip, CircularProgress, Grid, Stack} from "@mui/material";
import Dropzone from 'react-dropzone'
import {BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip,} from 'chart.js';
import {Bar} from 'react-chartjs-2';
import axios from 'axios'


function indexOfMax(arr) {
    if (arr.length === 0) {
        return -1;
    }

    var max = arr[0];
    var maxIndex = 0;

    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }
    }

    return maxIndex;
}

export default function UploadImages() {
    const [classLabels, setClassLabels] = useState(null);
    const [images, setImages] = useState([]);
    const [imageURLs, setImageURLs] = useState([])
    const [loadingData, setLoadingData] = useState(false);
    const [confidenceState, setConfidenceState] = useState(null);
    const [predictedClassState, setPredictedClassState] = useState(null);
    const [apiScores, setApiScores] = useState(null)

    const [mlData, setMlData] = useState({



        labels: ['amusement', 'anger', 'awe', 'contentment', 'disgust', 'excitement', 'fear', 'sadness'],

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
        labels: ['amusement', 'anger', 'awe', 'contentment', 'disgust', 'excitement', 'fear', 'sadness'],
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
        // const loadModel = async () => {
        //     setLoadingModel(true)
        //     const model_url = "https://paintingemotion.s3.us-west-2.amazonaws.com/model.json";
        //     const model = await tf.loadLayersModel(model_url);
        //     setModel(model);
        //     setLoadingModel(false)

        // };
        const getClassLabels = async () => {
            const testLabel = ['amusement', 'anger', 'awe', 'contentment', 'disgust', 'excitement', 'fear', 'sadness']
            setClassLabels(testLabel);
        };
        // loadModel();
        getClassLabels();
        if (images.length < 1) {
            return
        }
        const newImageUrls = [];
        images.forEach(image => newImageUrls.push(URL.createObjectURL(image)))
        setImageURLs(newImageUrls)

    },[images]);









    const handleImageChange = async (files) => {
        if (files.length === 0) {
            setConfidenceState(null);
            setPredictedClassState(null);
        }
        if (files.length === 1) {
            setLoadingData(true)
            setImages(files)

            let formData = new FormData();
            formData.append("file", files[0] ? files[0] : null);
            // console.log("starting response")
            let predictions = await axios('https://18.144.62.12/predict', {
                method: 'POST',
                data: formData
            })
            predictions = predictions.data
            // console.log(predictions)
            let response = await axios('https://18.144.62.12/upload', {
                method: 'POST',
                data: formData
            })
            setApiScores(response.data)
            // console.log(response)

            const [predictedClass, confidence] = tf.tidy(async () => {
                // const tensorImg = tf.browser.fromPixels(image).resizeNearestNeighbor([120, 120]).toFloat().expandDims();
                // const result = model.predict(tensorImg);
                // const predictions = result.dataSync();
                predictions = predictions.replace('[','');
                predictions = predictions.replace(']','');
                predictions = predictions.split(' ');
                predictions = predictions.map(Number)
                for( var i = 0; i < predictions.length; i++){ 
                    if ( predictions[i] === 0) { 
                        predictions.splice(i, 1); 
                    }
                }
                const predicted_index = indexOfMax(predictions);
                const predictedClass = classLabels[predicted_index];
                // console.log(predictions, predictedClass)
                setLoadingData(false);

                setMlData({
                    labels: ['amusement', 'anger', 'awe', 'contentment', 'disgust', 'excitement', 'fear', 'sadness'],
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
                    labels: ['amusement', 'anger', 'awe', 'contentment', 'disgust', 'excitement', 'fear', 'sadness'],
                    datasets: [
                        {
                            label: "Confidence",
                            data: [.2,.5,.6,.2,.1,.5,.8,.2],
                            fill: true,
                            backgroundColor: "rgba(6, 156,51, .3)",
                            borderColor: "#02b844",
                        }
                    ]
                })
                // console.log("hello, before state changes")
                const confidence = Math.round(predictions[predicted_index] * 100);
                setConfidenceState(confidence)
                setPredictedClassState(predictedClass)
                setLoadingData(false)
                return [predictedClass, confidence];
            });
            setConfidenceState(confidence)
            setPredictedClassState(predictedClass)
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
                    <Stack direction={'row'} spacing={2} alignItems={'center'} justifyContent={'center'} marginTop={5}>
                        <Chip
                            label={predictedClassState === null ? "Prediction:" : `Prediction: ${predictedClassState}`}
                            style={{justifyContent: "left"}}
                            variant="outlined"
                            alignItems={'center'}
                            justifyContent={'center'}
                        />
                        <Chip
                            label={confidenceState === null ? "Confidence:" : `Confidence: ${confidenceState}%`}
                            style={{justifyContent: "left"}}
                            variant="outlined"
                            alignItems={'center'}
                            justifyContent={'center'}
                        />
                        <text>{apiScores}</text>
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
                <a href='https://github.com/AngryAbstractV'>Github Repo</a>
                <text>AAV-Team for CS4360</text>
            </Grid>
            <Backdrop sx={{color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1}} open={loadingData}>
                {'Using Model'}
                <CircularProgress color="inherit"/>
            </Backdrop>
        </Fragment>
    );
}
