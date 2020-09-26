# Saweria API

Node.js API Wrapper for [Saweria.co](https://saweria.co/)

## Installation

```
npm install saweria
```

## Example

```js
const SaweriaClient = require("saweria");

const client = new SaweriaClient();


client.on("login", (user) => {
	console.log("Logged in as: ", user.username);
});

client.on("donation", (donation) => {
	console.log(donation);
});

client.login("email", "password");
// or with otp
client.login("email", "password", "otp");

```

# Client API

### `async login(email, password, otp = "")`

Login to Saweria. If the account has no 2FA enabled, `otp` will be ignored.

This will set the default header authorization value for the future requests with user's JWT

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

### `async getTransaction(page = 1, pageSize = 15)`

Get user's transaction list. Accepts these parameters:

- `page`: What page of transaction to get (Default = `1`)
- `pageSize`: How many transactions per page (Default = `15`)

---

### `async getMilestoneProgress(fromDate)`

Get milestone progress from passed date with `dd-mm-yyyy` format until now.

---

### `async getLeaderboard(period = "all")`

Get donation leaderboard from given time period.

`period` can be `"all"`, `"year"`, `"month"`, or `"week"` (Default = `"all"`)

---

### `on(eventName, callback)`

Listen to client [events](#Client-Events) and execute `callback` when emitted


# Client Events

### `login`

Emitted when client successfully logged in. Callback accepts [`User`](src/types.ts) as the first parameter 

Example:
```js
client.on("login", (user) => {
	console.log("Logged in as: ", user.username);
});
```

---

### `donation`

Emitted when client received a donation. Callback accepts [`EmittedDonation`](src/types.ts) as the first parameter

Example:
```js
client.on("donation", (donation) => {
    console.log(donation);
})
```