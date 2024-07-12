// set TensorFlow.js backend to WebGl
tf.setBackend('webgl').then(() => {
    console.log('TensorFlow.js is now using WebGL backend');
    init();
});


// Initialize the map
var map = L.map('map').setView([20.5937, 78.9629], 5);



// Add base layers
var osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var satelliteLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.opentopomap.org">OpenTopoMap</a> contributors'
});

var layers = {
    'osm': osmLayer,
    'satellite': satelliteLayer
};


// Initialize the speech-commands recognizer
const recognizer = speechCommands.create('BROWSER_FFT');

async function init() {
    await recognizer.ensureModelLoaded();
    const words = recognizer.wordLabels(); // Get the words the recognizer is trained on
    console.log(words);

    recognizer.listen(result => {
        const scores = result.scores; // Probability of prediction for each word
        const highestScore = Math.max(...scores);
        const commandIndex = scores.indexOf(highestScore);
        const command = words[commandIndex];

        console.log(`Command: ${command}, Score: ${highestScore}`);

        // Implement command handling here
        if (command === 'up') {
            map.panBy([0, -100]);
        } else if (command === 'down') {
            map.panBy([0, 100]);
        } else if (command === 'left') {
            map.panBy([-100, 0]);
        } else if (command === 'right') {
            console.log('moving right');
            map.panBy([100, 0]);
        } else if (command === 'magnify') {
            console.log('zooming in');
            map.zoomIn();
        } else if (command === 'zoom out') {
            map.zoomOut();
        } else if (command.startsWith('go to ')) {
            const place = command.slice(6); // Remove 'go to ' from the command
            geocodePlace(place);
        } else if (command.startsWith('show ')) {
            const layerName = command.slice(5); // Remove 'show ' from the command
            if (layers[layerName]) {
                map.addLayer(layers[layerName]);
            }
        } else if (command.startsWith('hide ')) {
            const layerName = command.slice(5); // Remove 'hide ' from the command
            if (layers[layerName]) {
                map.removeLayer(layers[layerName]);
            }
        } else if (command.startsWith('locate ')) {
            const place = command.slice(7); // Remove 'add marker at ' from the command
            geocodeAndAddMarker(place);
        }


    }, {
        probabilityThreshold: 0.80
    });
}

async function geocodePlace(place) {
    const apiKey = '4294080e2d7648e8b230760072e16e00'; // Replace with your OpenCage API key
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(place)}&key=${apiKey}`;
    try {
        const response = await axios.get(url);
        if (response.data.results.length > 0) {
            const { lat, lng } = response.data.results[0].geometry;
            map.setView([lat, lng], 13);
        } else {
            console.log('Place not found');
        }
    } catch (error) {
        console.error('Error with geocoding service:', error);
    }
}

async function geocodeAndAddMarker(place) {
    const apiKey = '4294080e2d7648e8b230760072e16e00'; // Replace with your OpenCage API key
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(place)}&key=${apiKey}`;
    try {
        const response = await axios.get(url);
        if (response.data.results.length > 0) {
            const { lat, lng } = response.data.results[0].geometry;
            L.marker([lat, lng]).addTo(map);
        } else {
            console.log('Place not found');
        }
    } catch (error) {
        console.error('Error with geocoding service:', error);
    }
}

// init();