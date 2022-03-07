// Our town tab (strings)
var villes = [];

// API JCDecaux Url
const urlContracts = 'https://api.jcdecaux.com/vls/v3/contracts?apiKey=7886a12c53604b2668a08582a04795afcc9375b0';
const urlStations = 'https://api.jcdecaux.com/vls/v3/stations?apiKey=7886a12c53604b2668a08582a04795afcc9375b0';

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
 * A function that return all contracts from belgia and france
 */
async function getContracts() {

    let data = await getData(urlContracts);
    // This line is mean to get all the town in BE & FR  of all datas from the API.
    result = data.filter(elem => elem.country_code === "BE" || elem.country_code === "FR");
    result.forEach(elem => villes.push(elem.name));
}

/**
 * This function is mean to create an array of HTML nodes according to the datas given in parameters, witch is here attach every station to the city they're in. 
 * @param {*} dataStation 
 * @returns An array of HTML node
 */
function createList(dataStation) {
    let listeVille = [];
    for (var i = 0; i < villes.length; i++) {
        let bloc = document.createElement('div'); // bloc that contain name of the city, and the stations attach.
        let ville = document.createElement('a'); // name of every city
        let liste = document.createElement('div'); // list of station from cities
        liste.className = "hidden";
        liste.id = villes[i];
        ville.textContent = villes[i];
        for (var j = 0; j < dataStation.length; j++) {
            if (dataStation[j].contractName == villes[i]) {
                let station = document.createElement('p');
                station.textContent = dataStation[j].name;
                liste.appendChild(station);
            }
        }

        bloc.append(ville);
        bloc.append(liste);
        listeVille.push(bloc);
    }
    return listeVille;
}

/**
 * A function mean to create all click event on a html node. and call createList()
 */
async function listAllStations() {
    let data = await getData(urlStations);
    createList(data).forEach(elem => document.getElementById("list").appendChild(elem)); //Call of createList() to get the array of HTML node.
    for (const ville of villes) { //a loop on every city
        for (const a of document.querySelectorAll('a')) {
            if (a.textContent == ville) {
                a.addEventListener("click", () => { //creation of clic event
                    let tmp = document.getElementById(ville);
                    tmp.className == "hidden" ? (tmp.className = "villeStation", tmp.style.display = "flex") : (tmp.className = "hidden", tmp.style.display = "none"); // if hidden then set visible and if visible set hidden.
                })
            }
        }
        let menu = document.getElementById(ville);
        menu.style.display = "none";
        menu.className = "hidden";
    }
}

getContracts();
listAllStations();