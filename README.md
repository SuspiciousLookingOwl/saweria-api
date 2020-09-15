# Saweria API

Node.js API Wrapper for [Saweria.co](https://saweria.co/)

## Installatioin

```
npm install saweria
```

## Example

```js
const SaweriaClient = require("saweria");

const client = new SaweriaClient();

(async() => {
    await client.login("email", "password");
    console.log(await client.getBalance());
})();

```

## Client API

---

### `async login(email, password)`

Login to Saweria (2FA is not supported yet).

This will set the default header authorization value for the future requests with user's JWT

Returns [`User`](src/types.ts) object if succeed.

---

### `logout()`

Removes authorization header from HTTP client, preventing future requests.

---

### `setJWT(jwt)`

Set the default header authorization value for the future requests with passed JWT.

If you already have your JWT, you can call this function and pass the JWT instead of login

---

### `async getStreamKey()`

Get user's stream key

---

### `async getBalance()`

Get user's balance

---

### `async getAvailableBalance()`

Get user's available balance to disburse

---

### `async getTransaction(page, pageSize)`

Get user's transaction list. Accepts these parameters:

- `page`: What page of transaction to get (Default = `1`)
- `pageSize`: How many transactions per page (Default = `15`)