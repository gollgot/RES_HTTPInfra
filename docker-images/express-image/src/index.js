var express = require('express');
var Chance = require('chance');

var app = express();
var chance = new Chance();

app.get('/', function(request, response){
    response.send( generateCities() );
});


app.listen(3000, function(){
    console.log('Accepting HTTP requests on port 3000');
});

//console.log("Voici un animal : " + chance.animal());

function generateCities() {
    var nbOfCities = chance.integer({
        min: 0,
        max: 10
    });

    console.log(nbOfCities);

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