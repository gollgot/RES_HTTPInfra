# Etape4: Requête AJAX avec JQuery

## Description
Dans cette 4ème partie nous allons permettre à une page web de mettre à jour une partie spécique du code dynamiquement grâce à des requêtes AJAX. Chaque deux secondes, une requête va aller récupérer un animal sous le format JSON vers l'API express et mettre à jour une partie du site statique avec le nom de l'animal.

## Travail effectué
Le travail réalisé lors de cette étape est disponible dans notre [repo GitHub](https://github.com/gollgot/RES_HTTPInfra/tree/fb-ajax-jqueryy).

Il n'y a eu aucun changement dans les Dockerfiles ou autre configuration. Le but de cette étape est de lancer une requête AJAX toutes les 2 secondes depuis le site statique (via un script javascript). La requête va récupérer en JSON le nom d'un animal sur l'API (application dynamique) et va mettre à jour un élément du DOM afin de mettre a jour une partie spécifique du site, sans avoir un rafraîchissement complet de celui-ci.

### Javascript "animals.js"
Voici le script **animals.js** qui est chargé à la fin de l'HTML du site statique.

``` javascript
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
```
La fonction loadAnimal() va envoyer une requête AJAX sur l'API (application web dynamique) et ainsi récupérer un animal. Le DOM est ensuite modifié afin de changer le texte de la balise ayant la classe "pet" par le nom de l'animal récupéré.

La fonction est ensuite relancée à l'infini dans un interval de 2 secondes.

### Marche à suivre pour démarrer l'infrastructure
1. Reconstruire les images des dossiers apache-php-image et express-image en utilisant les scripts build contenus dans chacun d'eux.
1. Démarrer les deux premiers containers avec les scripts `run-container-static.sh` et `run-container-express.sh` du dossier `apache-reverse-proxy`.
1. A l'aide de la commande `docker inspect <container> | grep -i ipaddr` récupérer les addresses IP des deux containers.
1. Dans le fichier `apache-reverse-proxy/conf/sites-available/001-reverse-proxy.conf` remplacer les champs `<IP_STATIC_SERVER>` et `<IP_DYNAMIC_SERVER>` par les adresses IP correspondantes récupérées précédemment.
1. Construire l'image du reverse proxy avec le script `build-image-reverse-proxy.sh`
1. Ajouter l'entrée `<IP docker> labohttp.ch` dans le fichier `hosts` de la machine hôte (en prenant soin de remplacer `<IP docker>` par l'adresse de la VM docker, sur Linux 127.0.0.1, sur Windows l'adresse donnée par docker toolbox)
1. Démarrer son container avec le script `run-container-reverse-proxy.sh`.
1. Il est maintenant possible d'accéder au deux serveurs web, static et dynamique, via les URL `labohttp.ch:8080/` et `labohttp.ch:8080/api/` respectivement, en utilisant le port 8080.
