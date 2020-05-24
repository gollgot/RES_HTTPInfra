# Etape supplémentaire 4: Managment UI

## Outil
Pour cette dernière étape, nous allons utiliser [Portainer](https://www.portainer.io) qui permet une gestion complète de notre environnement Docker, à savoir création ,suppression de container, etc.

### Installation
Afin d'installer Portainer correctement, nous avons suivi la [documentation](https://www.portainer.io/installation/) officielle.

Pour commencer, il faut déployer le server Portainer à l'aide des commandes suivantes:
```
$ docker volume create portainer_data
$ docker run -d -p 8000:8000 -p 9000:9000 --name=portainer --restart=always -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer
```
Ceci va directement démarrer un container Portainer en utilisant leur image distante. Après avoir exécuté ces deux commandes, nous avons accès à l'interface via l'adresse `localhost:9000` ou `labohttp.ch:9000` dans notre cas car nous avons configuré le fichier `hosts` en conséquence. Ceci nous mène à un écran de login où nous créons un compte administrateur.

Après avoir créé l'administrateur nous avons le choix entre différents types d'environnement que nous souhaitons gérer: local, remote, agent ou azure. Dans notre cas, nous souhaitons gérer un environnement local.

### Utilisation
[Portainer interface](screenschots/portainer.png)

Arrivé sur la page d'accueil, nous pouvons accéder à tous nos containers en cliquant sur "Container" dans le menu latéral, nous menant à la vue ci-dessus. Nous avons maintenant accès à de nombreuses fonctionnalités faisant analogie aux différentes commandes docker comme:
- lister tous les containers,
- démarrer et stopper les containers,
- exécuter une console dans un container,
- faire un "inspect" pour accéder aux informations du container,
- obtenir les logs ou statistiques matériels,
- créer de nouveaux containers,
- etc.

En observant le menu de gauche, nous voyons qu'il existe de nombreuses autres fonctionnalités, notamment pour gérer nos images docker.

En somme, Portainer offre une interface graphique intuitive permettant de faire tout ce qui est possible avec les commandes `docker`.