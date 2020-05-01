# Etape 1: Serveur HTTP static (apache httpd)

## Description
Dans cette première partie de laboratoire nous allons mettre en place, via un container docker, un serveur web : apache httpd


## Travail effectué

Le travail réalisé lors de cette étape est disponible dans notre [repo GitHub](https://github.com/gollgot/RES_HTTPInfra/tree/fb-apache-static/docker-images).

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

## Scripts

**Script `build-image.sh`**  
permet de créer l'image Docker personnalisée `res/apache_php` basée sur `php:7.4.5-apache`

**Script `run-container.sh`**  
créé un nouveau container avec notre image `res/apache_php` créée précédemment. Le container sera lancé en arrière plan et le port TCP 8080 du client sera mappé avec le port TCP 80 du serveur web (container).

*ATTENTION, si une modification est effectuée dans les fichiers sources du site, il est impératif de relancer le build de l'image afin que les copies des fichiers soient bien re-faites dans le container, puis de recréer le container.*
