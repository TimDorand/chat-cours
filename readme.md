#Chat

##Setup

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
  "username": "John Doe"
}
```