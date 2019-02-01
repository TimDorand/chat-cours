# Chat
Socket io chat with chartrooms and Messenger look and feel.

## Run the chat with docker

Prerequisites
```
$ docker -v
Docker version 18.09.1, build 4c52b90
$ docker-compose -v
docker-compose version 1.23.2, build 1110ad01
```

```
git clone https://github.com/TimDorand/chat-cours
cd chat-cours
docker-compose up --build
```

![Demo chat](http://g.recordit.co/ymP9OKMjzm.gif)

Le projet est un chat développé en node.js, à l’aide de socket.io. La base de données est faite avec redis.
Lorsqu’on se connecte au chat un nom d’utilisateur nous est demandé. On accède alors à la chatroom principale, on peut également créer une nouvelle chatroom sur le volet de gauche. Le volet de droite est consacré à la liste des membres connectés.
Le chat est sur le volet du milieu.

Pour intégrer le projet, il faut d’abord cloner le projet : https://github.com/TimDorand/chat-cours

Une fois que l’on vous aura ajouté en tant que collaborateur sur le repository github, vous pourrez travailler dessus (faire des push etc…)
Une fois le projet cloné, il vous faut simplement effectuer la commande “docker-compose up” pour installer l’environnement de travail nécessaire au projet.




[Access local chat (http://localhost:8080)](http://localhost:8888)

### Monitoring

- [cAdvisor](http://localhost:8080)

- [grafana](http://localhost:3000)



## Without Docker Setup

Install /node_modules/

```bash
$ npm i && npm start
```

## Events

### Server

**chat.join**

```js
{
  "username": "John Doe"
}
```

**chat.message**

````js
{
  "username": "John Doe"
  "message": "John message"
}
````
### Client

**chat.join**

```js
{
  "username": "John Doe",
  "ip": "127.0.0.1"
}

```



> Timothée Dorand, Arthur Leroux, Camil Mesfioui
