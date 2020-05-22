# Etape 5: Configuration dynamique du reverse proxy
## Description
Dans cette étape, nous poursuivons le travail de l'étape 3 en rendant dynamique la configuration des adresses IP dans le container du serveur reverse proxy. Pour ce faire nous allons remplacer le fichier `apache2-foreground` du serveur Apache afin de permettre l'exécution d'un fichier PHP qui créera le fichier des virtual hosts.

## Travail effectué
Le travail réalisé lors de cette étape est disponible dans notre [repo GitHub](https://github.com/gollgot/RES_HTTPInfra/tree/fb-dynamic-configuration).

### Dockerfile
La base du dockerfile de cette étape est la même que celle des étapes précédentes. Nous avons ajouté en plus deux instructions COPY:
- la première pour copier le script `apache2-foreground` dans le container,
- la deuxième pour copier le dossier `template`, qui contient le fichier PHP `config-template.php`, dans le container.

```
FROM php:7.4.5-apache

RUN apt-get update && \
    apt-get install -y nano
    
COPY apache2-foreground /usr/local/bin/
COPY templates /var/apache2/templates

COPY conf/ /etc/apache2

RUN a2enmod proxy proxy_http
RUN a2ensite 000-* 001-*
```

### apache2-foreground
Ce fichier à été initialement récupéré du [repo github](https://github.com/docker-library/php/tree/master/7.4/buster/apache) de l'image docker PHP que nous avons utilisé pour nos containers. Son contenu diffère de celui utilisé dans les webcasts fournis. En effet, il contient diverses instructions supplémentaires ayant notamment pour but de spécifier d'autres variables d'environnement cruciales, comme par exemple `APACHE_RUN_DIR` qui désigne le dossier d'exécution d'Apache.  
A la fin de ce script, nous avons ajouté le bloc d'instructions suivant: 
```
echo "Setup for RES lab..."
echo "Static App URL: $STATIC_APP"
echo "Dynamic App URL: $DYNAMIC_APP"
php /var/apache2/templates/config-template.php > /etc/apache2/sites-available/001-reverse-proxy.conf
```
Ce dernier à pour but de débugger les variables d'environnement fournies en paramètres et surtout d'exécuter le script `config-template.php` pour placer son résultat dans le fichier `001-reverse-proxy.conf` du container.

**ATTENTION:**  il est nécessaire de rendre le fichier `apache2-foreground` exécutable, par exemple avec la commande `chmod +x apache2-foreground`.

### config-template.php
Ce script php rend en sortie la configuration virtual host. Il utilise les variables d'environnement passées en paramètre lors de la création du container. Comme décrit plus haut, ce script sera utilisé par `apache2-foreground` qui va écrire le résultat dans le fichier `001-reverse-proxy.conf`, ce qui permet de créé dynamiquement la configuration virtual host.
```
<?php
	// Retrieve env variables
	$staticAppAddress = getenv('STATIC_APP');
	$dynamicAppAddress = getenv('DYNAMIC_APP');
?>

<VirtualHost *:80>
	ServerName labohttp.ch
	
	# animals, cities
	ProxyPass '/api/' 'http://<?php print "$dynamicAppAddress"; ?>/'
	ProxyPassReverse '/api/' 'http://<?php print "$dynamicAppAddress"; ?>/'
	
	# website
	ProxyPass '/' 'http://<?php print "$staticAppAddress"; ?>/'
	ProxyPassReverse '/' 'http://<?php print "$staticAppAddress"; ?>/'
</VirtualHost>
```

### Scripts container
Par rapport aux étapes précédentes, seule le script `run-container-reverse-prox.sh` a été modifié:
```
#!/bin/bash
docker run -d -e STATIC_APP=172.17.0.2:80 -e DYNAMIC_APP=172.17.0.3:3000 -p 8080:80 res/apache_rp
```
Ce script modifié, à l'aide de l'option `-e`, ajoute des variables d'environnement qui spécifient les adresses IP et ports des deux containers des sites web. Selon les adresses IP des containers spécifiés, il est nécessaire de modifier la commande avec les adresses correspondantes. Ainsi, bien qu'il soit plus pratique de taper directement la commande manuellement afin d'éviter une erreur, nous avons tout de même mis à jour le script pour avoir un modèle de cette commande.

### Marche à suivre pour démarrer l'infrastructure
1. Reconstruire l'image du server-proxy avec le script `build-image-reverse-proxy.sh`.
1. Rendre le fichier `apache2-foreground` exécutable avec `chmod +x apache2-foreground`.
1. Démarrer les deux premiers containers avec les scripts `run-container-static.sh` et `run-container-express.sh`.
1. A l'aide de la commande `docker inspect <container> | grep -i ipaddr` récupérer les addresses IP de ces deux containers.
1. Démarrer le container du reverse proxy avec le script `run-container-reverse-proxy.sh`, en prenant soin de mettre les adresses IP récupérées précédemment en paramètre ainsi que les ports: 80 pour le static et 3000 pour l'express.
1. Il est maintenant possible d'accéder au deux serveurs web, static et express, via les URL `/` et `/api/` respectivement, en utilisant le port 8080. Pour y accéder via le domaine "labohttp.ch" sur un navigateur, il est nécessaire d'ajouter l'entrée ci-dessous dans le fichier `hosts` de la machine (en prenant soin de remplacer `<IP docker>` par l'adresse de la VM docker, sur Linux 127.0.0.1, sur Windows l'adresse donnée par docker toolbox)
```
<IP docker> labohttp.ch
```