import React, {useState, useEffect} from "react";
import "./style.css"
import * as tf from "@tensorflow/tfjs";


export default function UploadImages() {
    const [model, setModel] = useState(null);
    const [classLabels, setClassLabels] = useState(null);


    useEffect(() => {
        const loadModel = async () => {
            const model_url = "https://paintingemotion.s3.us-west-2.amazonaws.com/model.json";
            const model = await tf.loadLayersModel(model_url);
            setModel(model);
        };
        const getClassLabels = async () => {
            const testLabel = ["awe", "anger", "amusement", "contentment", "disgust",
                "excitement", "fear", "sadness"]
            setClassLabels(testLabel);
        };
        loadModel();
        getClassLabels();
    }, []);


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


    const [images, setImages] = useState([]);
    const [imageURLs, setImageURLs] = useState([])


    useEffect(() => {
        if (images.length < 1){
            return
        }
        const newImageUrls = [];
        images.forEach(image => newImageUrls.push(URL.createObjectURL(image)))
        setImageURLs(newImageUrls)
    }, [images]);

    async function onImageChange(files) {
        setImages([...files.target.files]);
        console.log(files.target.files)
        if (files.length === 0) {
            console.log("where the fuck is my image 1")
            setConfidence(null);
            setPredictedClass(null);
        }
        if (files.target.files.length === 1) {
            console.log("where the fuck is my image 2")
            const imageSrc = await readImageFile(files.target.files[0]);
            const image = await createHTMLImageElement(imageSrc);
            const [predictedClass, confidence] = tf.tidy(() => {
                const tensorImg = tf.browser.fromPixels(image).resizeNearestNeighbor([120, 120]).toFloat().expandDims();
                const result = model.predict(tensorImg);
                console.log(result)
                const predictions = result.dataSync();
                console.log(predictions)
                const predicted_index = result.as1D().argMax().dataSync()[0];
                const predictedClass = classLabels[predicted_index];
                const confidence = Math.round(predictions[predicted_index] * 100);
                console.log(confidence)

                return [predictedClass, confidence];
            });
            setPredictedClass(predictedClass);
            setConfidence(confidence);
        }
        console.log("where the fuck is my image 3")
    }

    return(
        <div className={"center"}>
            <input className={"center"} type="file" multiple accept={"image/*"} onChange={onImageChange}/>
            { imageURLs.map(imageSrc => <img className={"photo"} src={imageSrc}  alt={"Current_Image"}/>)}
            <div>
                <text>{confidence === null ? "Confidence:" : `Confidence: ${confidence}%`}</text>
            </div>
            <div>
                <text>{predictedClass === null ? "Predicted Emotion:" : `Predicted Emotion: ${predictedClass}`}</text>
            </div>
        </div>


    );
}


