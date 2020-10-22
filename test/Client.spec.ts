import Saweria from "../dist/Client";
import "dotenv/config";

describe("Saweria Client", () => {
	const saweria = new Saweria();

	it("login", async () => {
		await saweria.login(process.env.EMAIL as string, process.env.PASSWORD as string);
	});
    
	it("get account information", async () => {
		expect(await saweria.getAvailableBalance()).toEqual(0);
		expect(await saweria.getMilestoneProgress(new Date())).toEqual(0);
		expect(await saweria.getBalance()).toEqual(0);
		expect(await saweria.getLeaderboard()).toEqual([]);
		expect(await saweria.getTransaction()).toEqual([]);
		expect((await saweria.getUser()).verified).toEqual(false); 
	});
    
	it("listen to donation event", async () => {
		const handler = jest.fn();
		saweria.on("donation", handler); 
		await saweria.sendFakeDonation();
		await new Promise(r => setTimeout(r, 250));
		expect(handler).toBeCalledWith(expect.objectContaining({
			amount: 69420,
			donator: "Someguy",
			message: "THIS IS A FAKE MESSAGE! HAVE A GOOD ONE",
			sound: null
		}));
	});
    
	it("logout and prevent call", async () => {
		saweria.logout();
		await expect(saweria.getBalance()).rejects.toThrowError();
	});
});

