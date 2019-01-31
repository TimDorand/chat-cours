#Chat

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

Access http://localhost:3000



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
