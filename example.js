const SaweriaClient = require("saweria");

const client = new SaweriaClient();

client.on("login", () => {
	client.sendFakeDonation();
});

client.on("donation", (donation) => {
	console.log(donation);
});

client.login("vinjon99@gmail.com", "Jjnc7!@6dfHaj");
