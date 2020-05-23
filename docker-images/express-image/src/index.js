var express = require('express');
var Chance = require('chance');
var Ip = require('ip');

var app = express();
var chance = new Chance();  

app.get('/', function(request, response){
     response.send('Bienvenue sur le serveur <b>'+Ip.address()+'</b><br>Les routes sont: <ul><li>/cities/{number}</li><li>/animals/{type}/{number}</li></ul> où {number} doit être un nombre entier positif et {type} peut être "ocean", "desert", "grassland", "forest", "farm", "pet", ou "zoo".');
});

app.get('/cities/:number', function(request, response){
    response.send(generateCities(request.params.number));
});

app.get('/animals/:type/:number', function(request, response){
    response.send(generateAnimals(request.params.type, request.params.number));
});


app.listen(3000, function(){
    console.log('Accepting HTTP requests on port 3000');
});

function generateCities(nbOfCities) {
    var cities = [];
    for(var i = 0; i < nbOfCities; ++i){
        var cityName = chance.city();
        var cityState = chance.state({full:true});
        var cityZip = chance.zip(); 

        cities.push({
            name: cityName,
            state: cityState,
            zip: cityZip
        });
    }

    console.log(cities);
    return cities;
}

function generateAnimals(type, nbOfAnimals) {
    var animals = [];
    for(var i = 0; i < nbOfAnimals; ++i){
        var animal = chance.animal({type: type});

        animals.push({
            name: animal,
        });
    }

    console.log(animals);
    return animals;
}