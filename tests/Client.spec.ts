import "dotenv/config";
import waitForExpect from "wait-for-expect";
import { Client } from "../src";

describe("Saweria Client", () => {
	const client = new Client();

	it("login", async () => {
		await client.login(
			process.env.EMAIL as string,
			process.env.PASSWORD as string,
		);
	});

	it("get account information", async () => {
		expect(await client.getAvailableBalance()).toEqual(0);
		expect(await client.getMilestoneProgress(new Date())).toEqual(0);
		expect(await client.getBalance()).toEqual(0);
		expect(await client.getLeaderboard()).toEqual([]);
		expect(await client.getTransaction()).toEqual([]);
		expect((await client.getUser()).verified).toEqual(false);
	});

	it("listen to donation event", async () => {
		const donationsHandler = vitest.fn();
		const donationHandler = vitest.fn();
		client.on("donations", donationsHandler);
		client.on("donation", donationHandler);

		const expected = {
			amount: 69420,
			donator: "Someguy",
			message: "Testing 1 2 3 🤭",
			sound: null,
		};

		await client.sendFakeDonation();
		const donationsPromise = waitForExpect(() => {
			expect(donationsHandler).toBeCalledWith(
				expect.arrayContaining([expect.objectContaining(expected)]),
			);
		});
		const donationPromise = waitForExpect(() => {
			expect(donationHandler).toBeCalledWith(expect.objectContaining(expected));
		});

		await Promise.all([donationsPromise, donationPromise]);
	});

	it("logout and prevent call", async () => {
		client.logout();
		await expect(client.getBalance()).rejects.toThrowError();
	});
});
