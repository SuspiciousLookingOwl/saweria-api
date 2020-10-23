# Saweria API

Node.js API Wrapper for [Saweria.co](https://saweria.co/)

Check the [Changelog](https://github.com/SuspiciousLookingOwl/saweria-api/blob/master/CHANGELOG.md)

## Installation

```
npm i saweria
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
or only for donation event listener
```js
const SaweriaClient = require("saweria");

const client = new SaweriaClient();

client.setStreamKey("your-stream-key");

client.on("donation", (donation) => {
	console.log(donation);
});
```

# Client API

### `async login(jwt)`
### `async login(email, password, otp = "")`

Login to Saweria using JWT or email and password. If the account has no 2FA enabled, `otp` will be ignored.

This will set the default header authorization value for the future requests with user's JWT

Login with JWT is useful if your account has 2FA enabled and don't want to get your 2FA token every time you login. JWT generated by Saweria lasts for 72 hours, so you have to get a new JWT for your account every 72 hours. You can get your JWT by:

1. **Using this library**
   1. Log in to your account using `client.login(username, password)`
   2. Get the account JWT from `client.jwt`
2. **Using the web client**
   1. Go to [saweria.co](https://saweria.co/) and login to your account
   2. Open browser developer console, and execute `console.log(JSON.parse(localStorage["saweria-user-info"]).token);`
3. **Sending a request to login endpoint**
   1. Send a `POST` request to `https://api.saweria.co/auth/login` with these JSON body payload: 
   ```json
   {
     "email": "example@email.com",
     "password": "your-password",
     "otp": "your otp code, optional if your account doesn't have 2FA enabled"
   }
   ```
   2. Get the JWT token from `Authorization` response header.

---

### `logout()`

Removes authorization header from HTTP client, preventing future requests.

---

### `async setStreamKey(streamKey)`

Set the client's stream key, this can be used to listen to donation event without logging in.

---

### `async getStreamKey()`

Get user's stream key

---

### `async getUser()`

Get user profile information

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

### `async sendFakeDonation()`

Send a fake donation

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

Donation data example:
```js
{
  amount: '69420',
  donator: 'Someguy',
  media: {
    src: [
      'https://media2.giphy.com/media/gw3IWyGkC0rsazTi/giphy.webp',
      'https://media2.giphy.com/media/gw3IWyGkC0rsazTi/giphy.mp4',
      'https://media2.giphy.com/media/gw3IWyGkC0rsazTi/giphy.gif'
    ],
    tag: 'picture'
  },
  message: 'THIS IS A FAKE MESSAGE! HAVE A GOOD ONE',
  sound: {
    '1547679809default.ogg': 'https://saweria-space.sgp1.cdn.digitaloceanspaces.com/prd/sound/836d7a85-dd70-4028-85fb-00fd785f0928-c527b4f6bd6282e21e78c85343d496fa.ogg'
  }
}
```