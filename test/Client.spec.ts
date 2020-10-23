import Saweria from "../dist/Client";
import "dotenv/config";

describe("Saweria Client", () => {
	const client = new Saweria();

	it("login", async () => {
		await client.login(process.env.EMAIL as string, process.env.PASSWORD as string);
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
		client.on("donation", handler); 
		await client.sendFakeDonation();
		await new Promise(r => setTimeout(r, 250));
		expect(handler).toBeCalledWith(expect.objectContaining({
			amount: 69420,
			donator: "Someguy",
			message: "THIS IS A FAKE MESSAGE! HAVE A GOOD ONE",
			sound: null
		}));
	});
    
	it("logout and prevent call", async () => {
		client.logout();
		await expect(client.getBalance()).rejects.toThrowError();
	});
});

