# Etape supplémentaire 2: Load balancing -> Sticky sessions VS Round-Robin
## Description
Dans cette étape, nous allons comparer la notion de sticky sessions et celle de round robin. Pour cela nous mettrons en place un système de sticky sessions sur le cluster du site web statique. Nous laisserons le cluster de l'application web dynamique en round-robin (ce qui était par défaut jusqu'à maintenant).

## Travail effectué
Le travail réalisé lors de cette étape est disponible dans notre [repo GitHub](https://github.com/gollgot/RES_HTTPInfra/tree/fb-load-balancer).

### Sticky sessions
Lorsqu'une requête est mandatée vers un serveur d'arrière-plan particulier, toutes les requêtes suivantes du même utilisateur seront alors mandatées vers le même serveur d'arrière-plan. De nombreux répartiteurs de charge implémentent cette fonctionnalité via une table qui associe les adresses IP des clients aux serveurs d'arrière-plan.

Dans notre configuration, nous allons utiliser les headers HTTP ainsi que des cookies pour implémenter la notion de sticky sessions.

### Round-robin
Chaque requête envoyée au reverse proxy va être redirigé vers un serveur du cluster de manière incrémental et cyclique. Si nous avons 3 serveurs dans le cluster 1 (A,B,C), la première requête mandatera le serveur A, la seconde le B, la troisième le C et cela recommence vers A pour la prochaine requête, etc. 

### Dockerfile
La base du dockerfile de cette étape est la même que celle des étapes précédentes. Nous avons ajouté en plus le chargement d'un module apache permettant de gérer les headers HTTP qui est le module `headers`.

Le reste du docker file n'a pas changé.

```
FROM php:7.4.5-apache

RUN apt-get update && \
    apt-get install -y nano
    
COPY apache2-foreground /usr/local/bin/
COPY templates /var/apache2/templates

COPY conf/ /etc/apache2

RUN a2enmod proxy proxy_http proxy_balancer lbmethod_byrequests headers
RUN a2ensite 000-* 001-*
```

### apache2-foreground
Ce fichier n'a pas changé.

### config-template.php
Ce script php rend en sortie la configuration virtual host. Il utilise les variables d'environnement passées en paramètre lors de la création du container. Ce script sera utilisé par `apache2-foreground` qui va écrire le résultat dans le fichier `001-reverse-proxy.conf`, ce qui permet de créé dynamiquement la configuration virtual host.
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
	
	Header add Set-Cookie "ROUTEID=.%{BALANCER_WORKER_ROUTE}e; path=/" env=BALANCER_ROUTE_CHANGED
	<Proxy "balancer://static-cluster">
		BalancerMember 'http://<?php print "$staticAppAddress1"; ?>/' route=1
		BalancerMember 'http://<?php print "$staticAppAddress2"; ?>/' route=2
		ProxySet stickysession=ROUTEID
	</Proxy>

	# API
	ProxyPass '/api/' 'balancer://dynamic-cluster/'
	ProxyPassReverse '/api/' 'balancer://dynamic-cluster/'

	# Site web static
	ProxyPass '/' 'balancer://static-cluster/'
	ProxyPassReverse '/' 'balancer://mycluster1/'
	
</VirtualHost>

```
Voici les modifications apportées par rapport à l'étape précédente :

Nous avons ajouté le header `Header add Set-Cookie "ROUTEID=.%{BALANCER_WORKER_ROUTE}e; path=/" env=BALANCER_ROUTE_CHANGED` qui permet d'ajouter le header "Set-Cookie" à nos requête HTTP. Et nous définissons un cookie "ROUTEID" avec la route du BalancerMember choisi. Ainsi, il sera possible au reverse proxy de savoir quel serveur utiliser pour les prochaines requête de cet utilisateur.

Dans le cluster ou nous voulons ajouter les sticky sessions, a la fin des "BalancerMember" nous ajoutons les routes de 1 à n. Puis un `ProxySet stickysession=ROUTEID` afin que notre proxy sache qu'il faut utiliser notre ROUTEID comme cookie pour le sticky session.

### Scripts container
Le script pour lancer notre container reverse proxy ne change pas par rapport à l'étape précédente.

### Application web dynamique (API)
L'application web dynamique n'a pas changé

### Site web statique
Le site web statique n'a pas changé

### Marche à suivre pour démarrer l'infrastructure
1. Reconstruire l'image du server-proxy en retournant dans le dossier `docker-images/apache-reverse-proxy/` et lancant le script `build-image-reverse-proxy.sh`.
2. Rendre le fichier `apache2-foreground` exécutable avec `chmod +x apache2-foreground`.
3. Démarrer deux fois le container statique en lancant deux fois le script `run-container-static.sh`.
4. Démarrer deux fois le container dynamique en lancant deux fois le script `run-container-express.sh`.
5. Assurez-vous qu'il n'y ait que ces containers de lancé et dans l'ordre demandé dans les étapes précédentes. Si ce n'est pas le cas, il va falloir faire les 2 étapes suivantes. Sinon, démarrer le container du reverse proxy avec le script run-container-reverse-proxy.sh
- 6a: A l'aide de la commande `docker inspect <container> | grep -i ipaddr` récupérer les addresses IP des quatre containers.
- 6b: Démarrer le container du reverse proxy avec le script `run-container-reverse-proxy.sh`, en prenant soin de mettre les adresses IP récupérées précédemment en paramètre ainsi que les ports: 80 pour le static et 3000 pour l'express. Il doit y avoir deux containers statiques et deux containers dynamiques.
7. Il est maintenant possible d'accéder au site web via le domaine "labohttp.ch" sur un navigateur, il est cependant nécessaire d'ajouter l'entrée ci-dessous dans le fichier `hosts` de la machine (en prenant soin de remplacer `<IP docker>` par l'adresse de la VM docker, sur Linux 127.0.0.1, sur Windows l'adresse donnée par docker toolbox)
```
<IP docker> labohttp.ch
```
8. Si vous rafraichissez plusieurs fois la page du site web static, vous devriez voir que l'IP du serveur est toujours la même. Ceci montre le bon fonctionnement des "sticky sessions". Pour aller plus loin, en allant dans les developer tools de votre navigateur, il est possible de voir les headers de la requête envoyée (Request Headers) et on y retrouve le cookie `Cookie: ROUTEID=.1` ou `Cookie: ROUTEID=.2` qui correspond à la route définie dans notre cluster. Il est aussi possible d'ouvrir un autre onglet en navigation privé et il est possible qu'il aie un serveur différent du premier onglet.
9. Contrairement au site web statique, notre API est restée en mode round-robin, il est possible de le voir en allant à l'adresse "labohttp.ch:8080/api/" et en refraîchissant plusieurs fois la page, nous pouvons voir le load balancing s'effectuer en ode round-robin car les serveurs changent à chaque requête. 
