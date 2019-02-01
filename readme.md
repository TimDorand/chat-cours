# Chat
-----
Socket io chat with chartrooms and Messenger

## Docker

Prerequisites
```
$ docker -v
Docker version 18.09.1, build 4c52b90
$ docker-compose -v
docker-compose version 1.23.2, build 1110ad01
```

```
docker-compose up --build
```

[Access local chat (http://localhost:8080)](http://localhost:8888)

[Access cAdvisor](http://localhost:8080)

[Access grafana](localhost:3000)


![Demo chat](http://g.recordit.co/ymP9OKMjzm.gif)


## Without Docker Setup

Install /node_modules/

```bash
$ yarn start
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
