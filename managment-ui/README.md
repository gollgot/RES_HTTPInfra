# Etape supplémentaire 4: Managment UI

## Outil
Pour cette dernière étape, nous allons utiliser [Portainer](https://www.portainer.io) qui permet une gestion complète de notre environnement Docker, à savoir création ,suppression de container, etc.

### Installation
Afin d'installer Portainer correctement, nous avons suivi la [documentation](https://www.portainer.io/installation/) officielle de Portainer.

Pour commencer, il faut déployer le server Portainer à l'aide des commandes suivantes:
```
$ docker volume create portainer_data
$ docker run -d -p 8000:8000 -p 9000:9000 --name=portainer --restart=always -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer
```
Ceci va directement démarrer un container Portainer en utilisant leur image. Après avoir exécuté ces deux commandes, nous avons accès à l'interface via l'adresse `labohttp.ch:9000`. Ceci nous mène à un écran de login où nous créons un compte administrateur.

Après avoir créé l'administrateur nous avons le choix entre différents types d'environnement que nous souhaitons gérer: local, remote, agent ou azure. Dans notre cas, nous souhaitons gérer un environnement local.

### Utilisation
WIP