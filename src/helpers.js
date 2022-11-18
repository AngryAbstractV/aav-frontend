export function indexOfMax(arr) {
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

export function cleanPred(predictions) {
    predictions = predictions.replace('[','');
    predictions = predictions.replace(']','');
    predictions = predictions.split(' ');
    predictions = predictions.map(Number)
    for( var i = 0; i < predictions.length; i++){ 
        if ( predictions[i] === 0) { 
            predictions.splice(i, 1); 
        }
    }
    return predictions 
}