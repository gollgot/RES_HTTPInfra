# Etape3: Reverse proxy avec apache (configuration statique)

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
1. Démarrer les deux premiers containers avec les scripts `run-container-static.sh` et `run-container-express.sh` du dossier `apache-reverse-proxy`.
1. A l'aide de la commande `docker inspect <container> | grep -i ipaddr` récupérer les addresses IP des deux containers.
1. Dans le fichier `apache-reverse-proxy/conf/sites-available/001-reverse-proxy.conf` remplacer les champs `<IP_STATIC_SERVER>` et `<IP_DYNAMIC_SERVER>` par les adresses IP correspondantes récupérées précédemment.
1. Construire l'image du reverse proxy avec le script `build-image-reverse-proxy.sh`
1. Ajouter l'entrée `<IP docker> labohttp.ch` dans le fichier `hosts` de la machine hôte (en prenant soin de remplacer `<IP docker>` par l'adresse de la VM docker, sur Linux 127.0.0.1, sur Windows l'adresse donnée par docker toolbox)
1. Démarrer son container avec le script `run-container-reverse-proxy.sh`.
1. Il est maintenant possible d'accéder au deux serveurs web, static et dynamique, via les URL `labohttp.ch:8080/` et `labohttp.ch:8080/api/` respectivement, en utilisant le port 8080.
