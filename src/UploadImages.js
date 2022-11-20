import React, {Fragment, useEffect, useState} from "react";
import "./style.css"
import * as tf from "@tensorflow/tfjs";
import {Alert, Backdrop, Chip, CircularProgress, Grid, Stack} from "@mui/material";
import Dropzone from 'react-dropzone'
import {BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip,} from 'chart.js';
import {Bar} from 'react-chartjs-2';
import axios from 'axios'
import {indexOfMax, cleanPred} from "./helpers";
import ProfileCard from "./ProfileCard";

export default function UploadImages() {
    const [classLabels, setClassLabels] = useState(null);
    const [images, setImages] = useState([]);
    const [imageURLs, setImageURLs] = useState([])
    const [loadingData, setLoadingData] = useState(false);
    const [confidenceState, setConfidenceState] = useState(null);
    const [predictedClassState, setPredictedClassState] = useState(null);
    const [confidenceStateIP, setConfidenceStateIP] = useState(null);
    const [predictedClassStateIP, setPredictedClassStateIP] = useState(null);
    // const [apiScores, setApiScores] = useState(null)



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
            setConfidenceStateIP(null);
            setPredictedClassStateIP(null);
        }
        if (files.length === 1) {
            setLoadingData(true)
            setImages(files)

            let formData = new FormData();
            formData.append("file", files[0] ? files[0] : null);
            // console.log("starting response")
            // let predictions = await axios('http://127.0.0.1:8000/predictNN', {
            let predictions = await axios('https://3.101.34.157/predictNN', {
                method: 'POST',
                data: formData
            })
            predictions = predictions.data

            // let predictionsIP = await axios('http://127.0.0.1:8000/predictIP', {
            let predictionsIP = await axios('https://3.101.34.157/predictIP', {
                method: 'POST',
                data: formData
            })
            predictionsIP = predictionsIP.data
            // console.log(predictionsIP)

            // let response = await axios('http://127.0.0.1:8000/process', {
            // // let response = await axios('https://3.101.34.157/process', {
            //     method: 'POST',
            //     data: formData
            // })

            const [predictedClass, confidence, predictedClassIP, confidenceIP] = tf.tidy(async () => {
                predictions = cleanPred(predictions)
                const predicted_index = indexOfMax(predictions);
                const predictedClass = classLabels[predicted_index];
                predictionsIP = cleanPred(predictionsIP)
                const predicted_indexIP = indexOfMax(predictionsIP)
                const predictedClassIP = classLabels[predicted_indexIP]
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
                            data: predictionsIP,
                            // data: [.2,.5,.6,.2,.1,.5,.8,.2],
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
                const confidenceIP = Math.round(predictionsIP[predicted_indexIP] * 100);
                setConfidenceStateIP(confidenceIP)
                setPredictedClassStateIP(predictedClassIP)
                setLoadingData(false)
                // add IP to return statement when ready
                return [predictedClass, confidence, predictedClassIP, confidenceIP];
            });
            setConfidenceState(confidence)
            setPredictedClassState(predictedClass)
            setConfidenceStateIP(confidenceIP)
            setPredictedClassStateIP(predictedClassIP)
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
                text: "Image Processing Model",
            },
        },
        layout: {
            padding: {
                bottom: 0
            }

        },
        maintainAspectRatio: true,
        margin: 0
    };


    return (
        <Fragment>
            <Grid container className="App" direction="column" alignItems="center" justifyContent="center"
                  marginTop="5%">
                <div>
                    <Alert severity="warning">
                        <a href='https://3.101.34.157/'>Open this link and give permission to connect
                        to our EC2 server on AWS in order for our API to work. Your browser will give a security error because our server uses a self-signed certificate. Please follow steps to proceed to the site so that the selected image file can be sent to our API.</a></Alert>
                </div>
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
                    <Stack direction={'row'} spacing={2} alignItems={'center'} justifyContent={'center'} marginTop={5}>
                        <text>CNN Prediction</text>
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
                    </Stack>


                    <Stack direction={'row'} spacing={2} alignItems={'center'} justifyContent={'center'} marginTop={5}>
                        <text>Image Processing Prediction</text>
                        <Chip
                            label={predictedClassState === null ? "Prediction:" : `Prediction: ${predictedClassStateIP}`}
                            style={{justifyContent: "left"}}
                            variant="outlined"
                            alignItems={'center'}
                            justifyContent={'center'}
                        />
                        <Chip
                            label={confidenceState === null ? "Confidence:" : `Confidence: ${confidenceStateIP}%`}
                            style={{justifyContent: "left"}}
                            variant="outlined"
                            alignItems={'center'}
                            justifyContent={'center'}
                        />
                        {/* <text>{apiScores}</text> */}
                    </Stack>
                </Grid>

                <div className={"centerChart"}>
                    <div className={"chart"}>
                        <Bar options={optionsML} data={mlData}/>
                    </div>
                    <div className={"chart"}>
                        <Bar options={optionsIP} data={ipData}/>
                    </div>
                </div>
                <text style={{paddingTop: 50, paddingBottom: 50}}>The goal of this project is to accurately predict the emotion that one might feel from an abstract work of art. Our process uses two models, one that makes a prediction by using a Convolutional Neural Network and one that uses custom algorithms to score the image on movement, emphasis, variety, gradation, balance, and harmony and make a prediction from those scores.</text>

                <div style={{border: "1px solid grey", justifyContent: "space-between", alignItems: "center", display: "inline-flex"}}>
                    <ProfileCard img={require('./Images/DanielMartinez.jfif')} name={'Daniel Martinez'}
                    github={"https://github.com/OutbreakSource"} linkedIn={"https://www.linkedin.com/in/daniel-martinez-8823b21a7/"}/>
                    <ProfileCard img={require('./Images/NicoleWelch.jfif')} name={'Nicole Welch'}
                    github={"https://github.com/nicolewelch"} linkedIn={"https://www.linkedin.com/in/nicole-welch-36a584206/"}/>
                    <ProfileCard img={require('./Images/LetyFickling.jfif')} name={'Letitia Fickling'}
                    github={"https://github.com/Lfickling"} linkedIn={"https://www.linkedin.com/in/letitiafickling/"}/>
                    <ProfileCard img={require('.//Images/defaultImg.png')} name={'Sinh Mai'}
                    github={"https://github.com/SinhMai"} linkedIn={"https://www.linkedin.com/in/sinh-mai-64512018a/"}/>
                    <ProfileCard img={require('./Images/PatrickD.jfif')} name={'Patrick D\'Innocenzo'}
                    github={"https://github.com/pmdino"} linkedIn={"https://www.linkedin.com/in/patrickdinno/"}/>
                    <ProfileCard img={require('.//Images/defaultImg.png')} name={'Thu Thatch'}
                    github={"https://github.com/MeeH2"}/>
                    <ProfileCard img={require('./Images/defaultImg.png')} name={'Ren White'}
                    github={"https://github.com/SerenaWhite"}/>
                </div>


                <a href='https://github.com/AngryAbstractV'>Github Repo</a>
                <text>AAV-Team for CS4360</text>
            </Grid>
            <Backdrop sx={{color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1}} open={loadingData}>
                {'Using Model '}
                <CircularProgress color="inherit"/>
            </Backdrop>
        </Fragment>
    );
}
