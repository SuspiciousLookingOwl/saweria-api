import "dotenv/config";
import waitForExpect from "wait-for-expect";
import Saweria from "../dist/Client";

describe("Saweria Client", () => {
	const client = new Saweria();

	it("login", async () => {
		await client.login(
			process.env.EMAIL as string,
			process.env.PASSWORD as string
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
		const handler = jest.fn();
		client.on("donations", handler);
		await client.sendFakeDonation();
		await waitForExpect(() => {
			expect(handler).toBeCalledWith(
				expect.arrayContaining([
					expect.objectContaining({
						amount: 69420,
						donator: "Someguy",
						message: "THIS IS A FAKE MESSAGE! HAVE A GOOD ONE",
						sound: null,
					}),
				])
			);
		});
	});

	it("logout and prevent call", async () => {
		client.logout();
		await expect(client.getBalance()).rejects.toThrowError();
	});
});
