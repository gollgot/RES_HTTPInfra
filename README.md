# Etape supplémentaire 1: Load balancing -> multiple noeuds
## Description
Dans cette étape, nous poursuivons le travail de l'étape 5 en l'améliorant. Nous allons ajouter un load balencer, cela va permettre de définir des clusters, par exemple un cluster-static qui contient plusieurs instances du serveur statique, un cluster-dynamic qui va lui contenir plusieurs instances du serveur dynamique. Le load-balancer va permettre de gérer la montée en charge en aiguillant les requêtes des clients vers l'ou ou l'autre des serveurs présent dans un cluster.

## Travail effectué
Le travail réalisé lors de cette étape est disponible dans notre [repo GitHub](https://github.com/gollgot/RES_HTTPInfra/tree/fb-load-balancer).

### Dockerfile
La base du dockerfile de cette étape est la même que celle des étapes précédentes. Nous avons ajouté en plus le chargement de deux modules apache qui concerne le load balancing :
- proxy_balancer: Module officiel apache qui fonctionne avec celui du reverse proxy utilisé dans l'étape précédente. Cela va donc permettre à notre reverse proxy de pouvoir faire du load balancing.
- lbmethod_byrequests: Module devant être activer afin de pouvoir faire du load balancing en mode round robin (weighted). Il permet de distribuer les requêtes à tous les processus worker afin qu'ils traitent tous le nombre de requêtes pour lequel ils ont été configurés.

Le reste du docker file n'a pas changé.

```
FROM php:7.4.5-apache

RUN apt-get update && \
    apt-get install -y nano
    
COPY apache2-foreground /usr/local/bin/
COPY templates /var/apache2/templates

COPY conf/ /etc/apache2

RUN a2enmod proxy proxy_http proxy_balancer lbmethod_byrequests
RUN a2ensite 000-* 001-*
```

### apache2-foreground
Ce fichier n'a pas changé.

### config-template.php
Ce script php rend en sortie la configuration virtual host. Il utilise les variables d'environnement passées en paramètre lors de la création du container. Comme décrit plus haut, ce script sera utilisé par `apache2-foreground` qui va écrire le résultat dans le fichier `001-reverse-proxy.conf`, ce qui permet de créé dynamiquement la configuration virtual host.
```
<?php
	$staticAppAddress1 = getenv('STATIC_APP_1');
	$staticAppAddress2 = getenv('STATIC_APP_2');
	$dynamicAppAddress1 = getenv('DYNAMIC_APP_1');
	$dynamicAppAddress2 = getenv('DYNAMIC_APP_2');
?>

<VirtualHost *:80>
	ServerName labohttp.ch

	<Proxy "balancer://dynamic-cluster">
		BalancerMember 'http://<?php print "$dynamicAppAddress1"; ?>'
		BalancerMember 'http://<?php print "$dynamicAppAddress2"; ?>'
	</Proxy>

	<Proxy "balancer://static-cluster">
		BalancerMember 'http://<?php print "$staticAppAddress1"; ?>/'
		BalancerMember 'http://<?php print "$staticAppAddress2"; ?>/'
	</Proxy>

	# API
	ProxyPass '/api/' 'balancer://dynamic-cluster/'
	ProxyPassReverse '/api/' 'balancer://dynamic-cluster/'

	# Site web static
	ProxyPass '/' 'balancer://static-cluster/'
	ProxyPassReverse '/' 'balancer://mycluster1/'
	
</VirtualHost>
```

Nous définissons deux clusters (dynamic-cluster et static-cluster). Chaque cluster défini des "balancerMember" qui sont des liesn vers chaque serveur que nous voulons ajouter au cluster (c'est donc plusieurs réplications du même site, ici le site web statique ou l'API dynamique). Ensuite nous avons les "ProxyPass et ProxyPassReverse" qui vont référencer les routes et quel cluster y est associé.

Nous avons donc deux clusters et dans chacun d'eux nous avons deux réplications du site en question. Notre reverse proxy va donc être capable d'aiguiller chaque requête vers le bon serveur web en fonction de la charge.

### Scripts container
```
#!/bin/bash
docker run -e STATIC_APP_1=172.17.0.2:80 -e STATIC_APP_2=172.17.0.3:80 -e DYNAMIC_APP_1=172.17.0.4:3000 -e DYNAMIC_APP_2=172.17.0.5:3000 -p 8080:80 res/apache_rp
```
La seule chose ajoutée à ce script par rapport à la précédente étape est que nous ajoutons 2 variables d'environnemnt en plus "STATIC_APP_2" et "DYNAMIC_APP_2" et nous avon renommé les précédente avec "_1" à la fin. Ainsi nous avons pour chaque serveur web (statique / dynamique), des variables d'environnements représentant leur IP.

### Site web statique
Afin de voir si le load balancing fonctionne correctement, nous avons modifier notre site web statique :
- Le fichier "index.html" à été renommé en "index.php" afin de pouvoir écrire du PHP à l'intérieur.
- Nous avons ajouté en PHP l'affichage de l'IP du serveur qui a généré la page web.

Il va donc falloir build une nouvelle fois l'image du serveur web static afin de prendre ces changements en compte.

### Marche à suivre pour démarrer l'infrastructure
1. Reconstruire l'image du site web static en allant dans le dossier `docker-images/apache-php-image/` et lancant le script `build-image.sh`.
2. Rendre le fichier `apache2-foreground` exécutable en retournant dans le dossier `docker-images/apache-reverse-proxy/` et en faisant `chmod +x apache2-foreground`.
3. Reconstruire l'image du server-proxy en lancant le script `build-image-reverse-proxy.sh`.
4. Ajouter l'entrée `<IP docker> labohttp.ch` dans le fichier `hosts` de la machine hôte (en prenant soin de remplacer `<IP docker>` par l'adresse de la VM docker, sur Linux 127.0.0.1, sur Windows l'adresse donnée par docker toolbox)
5. Démarrer deux fois le container statique en lancant deux fois le script `run-container-static.sh`.
6. Démarrer deux fois le container dynamique en lancant deux fois le script `run-container-express.sh`.
7. Assurer vous qu'il y a que ces containers de lancé et dans l'ordre demandé dans les étapes précédentes. Si ce n'est pas le cas, il va falloir faire les 2 étapes suivantes.
- 7a: A l'aide de la commande `docker inspect <container> | grep -i ipaddr` récupérer les addresses IP des quatre containers.
- 7b: Démarrer le container du reverse proxy avec le script `run-container-reverse-proxy.sh`, en prenant soin de mettre les adresses IP récupérées précédemment en paramètre ainsi que les ports: 80 pour le static et 3000 pour l'express. Il doit y avoir deux containers statiques et deux containers dynamiques.
8. Il est maintenant possible d'accéder au deux serveurs web, static et dynamique, via les URL `labohttp.ch:8080/` et `labohttp.ch:8080/api/` respectivement, en utilisant le port 8080.
9. Si vous rafraichissez plusieurs fois la page, vous devriez voir l'ip du serveur changer, cela signifie que le load balancing fonctionne correctement.
