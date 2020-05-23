# Etape supplémentaire 3: Dynamic cluster management
## Description
Dans cette étape, nous allons ajouter à notre solution actuelle un système de gestion dynamique de nos cluster. Pour se faire nous allons utiliser l'outil créer par apache qui est le **balancer-manager**.

## Travail effectué
Le travail réalisé lors de cette étape est disponible dans notre [repo GitHub](https://github.com/gollgot/RES_HTTPInfra/tree/fb-dynamic-configuration).

### Dockerfile
Ce fichier n'a pas changé

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

	<Location "/balancer-manager">
		SetHandler balancer-manager
	</Location>
	ProxyPass /balancer-manager !

	# API
	ProxyPass '/api/' 'balancer://dynamic-cluster/'
	ProxyPassReverse '/api/' 'balancer://dynamic-cluster/'

	# Site web static
	ProxyPass '/' 'balancer://static-cluster/'
	ProxyPassReverse '/' 'balancer://mycluster1/'
	
</VirtualHost>
```
Voici les modifications apportées par rapport à l'étape précédente :

Nous avons ajouté la partie :
```
<Location "/balancer-manager">
	SetHandler balancer-manager
</Location>
ProxyPass /balancer-manager !
```

Qui permet à l'appelle de la page "labohttp.ch:8080/balancer-manager" d'arriver sur l'outil permettant le management des clusters. C'est un outil proposé par apache et qui permet de facilement gérer nos clusters et workers à chaud.

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
5. Assurer vous qu'il y a que ces containers de lancé et dans l'ordre demandé dans les étapes précédentes. Si ce n'est pas le cas, il va falloir faire les 2 étapes suivantes.
- 6a: A l'aide de la commande `docker inspect <container> | grep -i ipaddr` récupérer les addresses IP des quatre containers.
- 6b: Démarrer le container du reverse proxy avec le script `run-container-reverse-proxy.sh`, en prenant soin de mettre les adresses IP récupérées précédemment en paramètre ainsi que les ports: 80 pour le static et 3000 pour l'express. Il doit y avoir deux containers statiques et deux containers dynamiques.
7. Il est maintenant possible d'accéder au site web via le domaine "labohttp.ch" sur un navigateur, il est cependant nécessaire d'ajouter l'entrée ci-dessous dans le fichier `hosts` de la machine (en prenant soin de remplacer `<IP docker>` par l'adresse de la VM docker, sur Linux 127.0.0.1, sur Windows l'adresse donnée par docker toolbox)
```
<IP docker> labohttp.ch
```

### Fonctionnement du "balancer manager"
En accédant à l'URL: "labohttp.ch:8080/balancer-manager" nous arrivons sur une page qui nous montre nos deux clusters (dynamic-cluster et static-cluster). Pour voir et tester le fonctionnement de cet outil, nous pouvons cliquer sur le worker "http://172.17.0.4:3000" qui est dans le "dynamic-cluster". Dans le formulaire du bas, dans la case "stopped" nous pouvons mettre son status à "on", puis "submit" les changements. 

Maintenant si nous accédons à notre API (http://labohttp.ch:8080/api/), en rafraîchissant plusieurs fois la page, nous pouvons voir que l'IP du serveur reste la même, à savoir: 172.17.0.5.

Si nous revenons sur notre balancer manager et remettons le status "stopped" du worker à "off". Si on retourne sur notre API on remarque que l'IP du serveur change denouveau.

Cela prouve donc le fonctionnement de notre balancer manager, il est possible d'effectuer des changements à chaud sans devoir relancer le reverse proxy ou loader une nouvelle confifuration.