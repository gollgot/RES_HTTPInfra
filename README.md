# Etape 1: Serveur HTTP static avec apache httpd

## Description
Dans cette première partie de laboratoire nous allons mettre en place, via un container docker, un serveur web : apache httpd. Celui-ci sera capable de servir des pages web statiques.


## Travail effectué
Le travail réalisé lors de cette étape est disponible dans notre [repo GitHub](https://github.com/gollgot/RES_HTTPInfra/tree/fb-apache-static/docker-images/apache-php-image).

### Dockerfile 
```
FROM php:7.4.5-apache
COPY src/ /var/www/html/
```

Pour cette étape nous nous basons sur l'image officelle **php** existante dans sa version **7.4.5** avec la variante **apache**. En effet, l'image php offre la possibilité de directement avoir une version qui inclu apache (le serveur web). L'utilité de php est à venir dans les prochaines parties, c'est pourquoi que nous avons pris cette image.

Ensuite nous configurons la copie de fichier dans le container. A savoir, on va copier notre dossier **src/** (contenant les sources de notre site) dans le dossier **/var/www/html** qui est le dossier à l'intérieur du container Docker. Ce dossier est spécifique car c'est un point d'entré du serveur web, c'est à dire que c'est dans ce dossier que le serveur web va chercher un .html ou .php.

*Voici le contenu du fichier de config du virtual host par défaut (/etc/apache2/sites-available/000-default.conf) :*

```
<VirtualHost *:80>
	ServerAdmin webmaster@localhost
	DocumentRoot /var/www/html

	ErrorLog ${APACHE_LOG_DIR}/error.log
	CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>

```

*On peut voir que c'est bien le dossier /var/www/html qui est le point d'entrée de notre site. C'est donc ce chemin qui doit être utilisé comme destination dans notre fichier Dockerfile.*

### Scripts

**Script `build-image.sh`**  
permet de créer l'image Docker personnalisée `res/apache_php` basée sur `php:7.4.5-apache`

**Script `run-container.sh`**  
créé un nouveau container avec l'image `res/apache_php` créée précédemment. Le container sera lancé en arrière plan et le port TCP 8080 du client sera mappé avec le port TCP 80 du serveur web (container).

*ATTENTION, si une modification est effectuée dans les fichiers sources du site, il est impératif de relancer le build de l'image afin que les copies des fichiers soient bien re-faites dans le container, puis de recréer le container.*

### Marche à suivre pour lancer le serveur web
1. Récupérer les fichiers sur notre [repo GitHub](https://github.com/gollgot/RES_HTTPInfra/tree/fb-apache-static/docker-images)
1. Aller dans le répertoire : **docker-images/apache-php-image/**
1. Lancer le script bash **build-image.sh** qui va créer l'image docker.
1. Lancer le script bash **run-container.sh** qui va lancer le container.
1. Sur votre navigateur, accéder à l'addresse **localhost:8080** (pour linux) ou **<IP_machine_virtuelle_docker>:8080** (windows) afin d'accéder au site web.

*Il est possible de modifier les sources du site en modifiant les fichiers html, css, etc. dans le dossier **src**. Ne pas oublier de relancer le script **build-image.sh** et **run-container.sh** si les sources ont été changées afin de recréer l'image docker et copier de nouveau les fichiers mis à jour, puis de relancer le container.*


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
Notre application express s'inspire naturellement de l'exemple donné dans les capsules webcasts vidéos. Nous avons néanmoins modifié les routes et les données retournées et ajouté des paramètres; voici les deux routes de notre application:

- `/cities/{number}`
- `/animals/{type}/{number}`

Les éléments entre accolades indiquent les paramètres. `{number}` désigne pour les deux routes le nombre d'éléments à retourner, tandis que `{type}` précise la catégorie d'animal à générer. Ce paramètre type peut prendre les valeur définient par la librairie chance.js: "ocean", "desert", "grassland", "forest", "farm", "pet", ou "zoo".

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

# Etape3: Reverse proxy avec apache ( /!\ configuration statique /!\ )

## Description

## Travail effectué
Le travail réalisé lors de cette étape est disponible dans notre [repo GitHub](https://github.com/gollgot/RES_HTTPInfra/tree/fb-apache-reverse-proxy/docker-images/apache-reverse-proxy).

### Dockerfile
```
FROM php:7.4.5-apache
COPY conf/ /etc/apache2

RUN a2enmod proxy proxy_http
RUN a2ensite 000-* 001-*
```

Pour cette image, nous avons besoin des fichiers `.conf` contenu dans le dossier conf, que nous copions dans le dossier de configuration de apache2 sur le container. Puis, il faut activer, à l'aide des commandes RUN, les modules proxy de apache et activer les sites(enable sites) selon les hôtes virtuels contenus dans les fichiers de configuration.

### Scripts

**Script `build-image-reverse-proxy.sh`**
va créer l'image du serveur proxy.


**Script `run-container-reverse-proxy.sh`**
démarre le container du serveur proxy son port 80 vers le 8080 de l'hôte.

**Script `run-container-static.sh`**
créé le container du site apache static.

**Script `run-container-express.sh`**
créé le container du site express js.

### Fichiers virtual hosts `.conf`
## 001-reverse-proxy.conf
```
<VirtualHost *:80>
	ServerName labohttp.ch
	
	# animals, cities
	ProxyPass "/api/" "http://<IP_DYNAMIC_SERVER>:3000/"
	ProxyPassReverse "/api/" "http://<IP_DYNAMIC_SERVER>:3000/"
	
	# website
	ProxyPass "/" "http://<IP_STATIC_SERVER>:80/"
	ProxyPassReverse "/" "http://<IP_STATIC_SERVER>:80/"
</VirtualHost>

```
Ce fichier de configuration sert a définir un virtual host spécifique pour notre reverse proxy. Il va répondre à toutes les requêtes spécifiant comme header **Host: labohttp.ch**.

Les lignes en dessous de *animals, cities* permette de définir une redirection de toutes les routes ayant comme préfixe "/api/" vers le serveur web dynamique.

Les lignes en dessous de *website* permette de définir une redirection de toutes les routes ayant comme préfixe "/" vers le serveur web static.

L'ordre à donc une importance, les préfixes (URL) les plus spécifiques sont en haut.

*/!\ ATTENTION : Ici nous avant une configuration de type statique, qui est donc peu maintenable. En effet il faut remplacer <IP_DYNAMIC_SERVER> et <IP_STATIC_SERVER> par respectivement l'IP de serveur web dynamique (express) et l'IP du serveur web statique /!\*

*Pour trouver les IP, il suffit de lancer les 2 container (serveur statique et dynamique) puis, lancer la commande `docker inspect <nom du container>`afin de savoir son IP.*



## 000-default.conf
```
<VirtualHost *:80>
</VirtualHost>

```
Ce fichier de configuration sert à définir un virtual host par défaut qui ne fera rien. Il est plus sécurisé de faire cela car sinon nous aurions que un seul virtual host qui est le reverse proxy, ainsi il serait pris comme virtual host par défaut, même si le header host n'est pas celui demandé. Comme cela nous avons donc une sécurité en plus.


### Marche à suivre pour démarrer l'infrastructure
1. Reconstruire les images des dossiers apache-php-image et express-image en utilisant les scripts build contenus dans chacun d'eux.
1. Démarrer les deux premiers containers avec les scripts `run-container-static.sh` et `run-container-express.sh`.
1. A l'aide de la commande `docker inspect <container> | grep -i ipaddr` récupérer les addresses IP des deux containers.
1. Dans le fichier `conf/sites-available/001-reverse-proxy.conf` remplacer les champs `<IP_STATIC_SERVER>` et `<IP_DYNAMIC_SERVER>` par les adresses IP correspondantes récupérées précédemment.
1. Construire l'image du reverse proxy avec le script `build-image-reverse-proxy.sh`
1. Démarrer son container avec le script `run-container-reverse-proxy.sh`.
1. Il est maintenant possible d'accéder au deux serveurs web, static et dynamique, via les URL `/` et `/api/` respectivement, en utilisant le port 8080. Pour y accéder via le domaine "labohttp.ch" sur un navigateur, il est nécessaire d'ajouter l'entrée ci-dessous dans le fichier `hosts` de la machine (en prenant soin de remplacer `<IP docker>` par l'adresse de la VM docker, sur Linux 127.0.0.1, sur Windows l'adresse donnée par docker toolbox)
```
<IP docker> labohttp.ch
```