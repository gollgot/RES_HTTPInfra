$(function(){

  function loadAnimal(){
    $.getJSON("/api/animals/pet/1", function(animal){
      console.log(animal);
      $(".pet").text(animal[0].name);
    });
  }
  
  loadAnimal();

  setInterval(loadAnimal, 2000);

});
