# Etape 2: Serveur HTTP dynamique avec express.js

## Description
Dans cette seconde partie de laboratoire nous allons cette fois-ci mettre en place un serveur web HTTP dynamique à l'aide du framework [express.js](https://expressjs.com/). Nous allons denouveau utiliser docker et le serveur web sera donc capable de nous rendre du contenu dynamique, créer à l'aide de javascript.


## Travail effectué
Le travail réalisé lors de cette étape est disponible dans notre [repo GitHub](https://github.com/gollgot/RES_HTTPInfra/tree/fb-express-dynamic/docker-images/express-image).

### Dockerfile 
```
FROM node:12.16.3
COPY src /opt/app

CMD ["node", "/opt/app/index.js"]
```

Pour cette étape nous nous basons sur l'image officelle **node** existante dans sa version **12.16.3** qui est la LTS (08.05.2020). 

Ensuite nous configurons la copie de fichier dans le container. A savoir, nous allons copier le dossier **src/** (contenant les sources de notre site) dans le dossier **/opt/app** qui est le dossier qui contiendra les sources à l'intérieur du container Docker. Il doit y avoir un fichier **index.js** dans le dossier **src**, cela sera le point d'entrée du site web.

Pour finir, la commande `node /opt/app/index.js` sera exécutée automatiquement lorsque le container sera monté. Cette commande permet d'exécuter le fichier javascript avec node. 

### Scripts

**Script `build-image.sh`**  
permet de créer l'image Docker personnalisée `res/express-cities` basée sur `node:12.16.3`.

**Script `run-container.sh`**  
créé un nouveau container avec l'image `res/express-cities` créée précédemment. Le container sera lancé avec le port TCP 8080 du client mappé avec le port TCP 3000 du serveur web (container).

*ATTENTION, si une modification est effectuée dans les fichiers sources du site, il est impératif de relancer le build de l'image afin que les copies des fichiers soient bien re-faites dans le container, puis de recréer le container.*

### Application Express
Notre application express s'inspire naturellement de l'exemple donné dans les capsules webcasts vidéos. Nous avons néanmoins modifié les routes GET ainsi que les données retournées et ajouté des paramètres; voici les deux routes GET de notre application:

- `/cities/{number}`
- `/animals/{type}/{number}`

Les éléments entre accolades indiquent les paramètres. `{number}` désigne pour les deux routes le nombre d'éléments à retourner, tandis que `{type}` précise la catégorie d'animal à générer. Ce paramètre type peut prendre les valeur définient par la librairie chance.js: "ocean", "desert", "grassland", "forest", "farm", "pet", ou "zoo". Si l'on accède à la route par défaut (/), un message décrivant les deux routes sus-mentionnées sera simplement affiché.

En cas de paramètre erroné, un message descriptif sera retourné de manière native.

### Marche à suivre pour lancer le serveur web
1. Installer [node js](https://nodejs.org/en/) sur votre machine
1. Récupérer les fichiers sur notre [repo GitHub](https://github.com/gollgot/RES_HTTPInfra/tree/fb-apache-static/docker-images)
1. Aller dans le répertoire : **docker-images/express-image/src**
1. Lancer la commande `npm install`, cela va installer localement (dans un dossier nodes_modules) toutes les dépendances liées au site web
1. Aller dans le répertoire : **docker-images/express-image**
1. Lancer le script bash **build-image.sh** qui va créer l'image docker.
1. Lancer le script bash **run-container.sh** qui va lancer le container.
1. Sur votre navigateur, accéder à l'addresse **localhost:8080** (pour linux) ou **<IP_machine_virtuelle_docker>:8080** (windows) afin d'accéder au site web.

*Il est possible de modifier les sources du site en modifiant le fichier js dans le dossier **src**. Ne pas oublier de relancer le script **build-image.sh** et **run-container.sh** si les sources ont été changées afin de recréer l'image docker et copier de nouveau les fichiers mis à jour, puis de relancer le container.*
