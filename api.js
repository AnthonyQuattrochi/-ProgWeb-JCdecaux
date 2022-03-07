// Our town tab (strings)
var villes = [];
var villesMarkers = [];
var stationsMarkers = [];

// API MapBox Key
const mapBoxToken = "pk.eyJ1IjoiYXJjdG9hc3QiLCJhIjoiY2t5b2plZWw0MDBvaTJxbzVzZTZmN2k5aCJ9.SeHjKy5lsUZ-Lqr6WdYozQ";

// API JCDecaux Url
const urlContracts = 'https://api.jcdecaux.com/vls/v3/contracts?apiKey=7886a12c53604b2668a08582a04795afcc9375b0';
const urlStations = 'https://api.jcdecaux.com/vls/v3/stations?apiKey=7886a12c53604b2668a08582a04795afcc9375b0';

// Initial zoom
const iniZoom = [47.487644132344606, 2.458356020870388];

// We initiate the Map
var map = L.map('map'/*, { zoomControl: false, scrollWheelZoom: false, doubleClickZoom: false }*/).setView(iniZoom, 6);
//map.dragging.disable();

// Gaving the map a quick revision with a custom template from MapBox
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=' + mapBoxToken, {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 16,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: mapBoxToken,
}).addTo(map);

/**
 * Get Api Data in json
 * @returns json The data
 */
async function getData(url) {
    let response = await fetch(url);

    if (response.ok) { // if HTTP-status is 200-299
        // get the response body (the method explained below)
        let json = await response.json();
        return json
    } else {
        alert("HTTP-Error: " + response.status);
    }
}

/**
 * We call the JDDecaux Web API to get all contracts and stash them into our tab
 */
async function getContracts() {

    let data = await getData(urlContracts);
    // We keep all the cities in french and belgium where there are bike stations
    result = data.filter(elem => elem.country_code === "BE" || elem.country_code === "FR");
    result.forEach(elem => villes.push(elem.name));

    // We call a method to calculate means bewteen stations (see the method for more infos)
    calculateMeans();
}



/**
 * Add markers for each city (contracts). Adding a 'onclick' event for each of them that leads to put the stations and create a previous button.
 * We remove all the markers including the marker clicked in order to see the stations properly
 * @param {tab} towns the tab which integrate teh name of the cities, there lat and lon
 */
function putMarkers(towns) {
    towns.forEach(function (elem) {
        let marker = L.marker([elem.latitude, elem.longitude]).addTo(map);
        villesMarkers.push({ville : elem.ville, markerLayer : marker});
        marker.on('click', function (e) {
            map.setView(e.latlng, 13);
            villesMarkers.forEach(function (m) {
                map.removeLayer(m.markerLayer);
            });
            createPrevButt();
            putStationsMarkers(elem.ville);
        });
    });
}

/**
 * Creating a 'previous' button on the dom that lead to reload the former page
 */
function createPrevButt(){
    var prevButtDom = document.createElement("input");
    prevButtDom.type = "button";
    prevButtDom.value = "Previous";
    prevButtDom.addEventListener("click", function () {
        location.reload();
    });
    document.getElementById("root").appendChild(prevButtDom);
}

/**
 * Put the stations markers of the city specified in the entry
 * Add popups on those markers which are showing infos on the specified station
 * 
 * @param {string} ville 
 */
async function putStationsMarkers(ville) {
    let data = await getData(urlStations);
    let stations = data.filter(elem => elem.contractName == ville);
    stations.forEach(function (elem) {
        let stationName = (elem.name).substring((elem.name).indexOf('-') + 2);
        let htmlText = "<h1>" + stationName + "</h1>";
        htmlText += "<p>Vélos disponibles : </p>";
        htmlText += "<ul>";
        htmlText += "<li>Vélos standards : " + elem.totalStands.availabilities.mechanicalBikes + "</li>";
        htmlText += "<li>Vélos électriques : " + elem.totalStands.availabilities.electricalBikes + "</li>";
        htmlText += "</ul>";
        htmlText += "<p>Nombre de places libres : " + (elem.totalStands.capacity - elem.totalStands.availabilities.bikes) + "</p>";
        let marker = L.marker([elem.position.latitude, elem.position.longitude]).bindPopup(htmlText).addTo(map);
        stationsMarkers.push(marker);
    });
}

/**
 * On récupère les latitudes et longitudes des stations dans les contrats que l'on a dans notre tableau We collect the lats and lons of the stations for all contracts 
 * to make it a mean and then found an approximate measure of the city's location
 */
async function calculateMeans() {
    result = [];
    let data = await getData(urlStations);
    let lat, lon, cpt;
    for (let i = 0; i < villes.length; i++) {
        cpt = 0; lat = 0; lon = 0;
        for (let j = 0; j < data.length; j++) {
            if (data[j].contractName == villes[i]) {
                cpt++;
                lat += data[j].position.latitude;
                lon += data[j].position.longitude;
            }
        }
        result.push({ ville: villes[i], latitude: lat / cpt, longitude: lon / cpt });
    }
    // We show the markers on the map
    putMarkers(result);
}

// NavBar script
let myForm = document.getElementById("formSearch");

// We had the listener
myForm.addEventListener('submit', function (e) {
    // Stoping the event of submit
    e.preventDefault();
    let myInput = document.getElementById("search");
    // Convert the string in lower case
    let response = myInput.value.toLowerCase();
    let myError = document.getElementById("error");

    if (response.trim() == "") {
        myError.innerHTML = "Ne laissez pas le champ vide...";

    } else if (!hasNumber(response) && !response.includes('-')) {
        myError.innerHTML = "";
        let trouve = false;
        let i = 0;
        while (!trouve && i< villes.length) {
            if (villes[i] == response) {
                trouve = true;
                villesMarkers.forEach(function(m){
                    if(m.ville == response){
                        map.setView(m.markerLayer.getLatLng(), 13);
                    }
                    map.removeLayer(m.markerLayer);
                });
                createPrevButt();
                putStationsMarkers(response);
            }
            i++;
        }
        if (!trouve) {
            $("#error").css("color", "yellow");
            myError.innerHTML = "Navré, cette ville ne fait pas partie de notre base de données...";
            $("#error").css("color", "red");
        }

    } else {
        myError.innerHTML = "Les villes ne contiennent ni accents, ni tiret, ni charactères numériques";
    }
});

function hasNumber(myString) {
    return /\d/.test(myString);
}

// Starting the activity
getContracts();