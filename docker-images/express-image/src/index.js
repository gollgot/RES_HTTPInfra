var express = require('express');
var Chance = require('chance');

var app = express();
var chance = new Chance();

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