import { Events, Guild } from "discord.js";
import fs from "node:fs";
import functions from "../functions.js";

export default {
	name: Events.GuildCreate,
	/**
	 * @param {Guild} guild
	 */
	async execute(guild) {
		const guilds = JSON.parse(fs.readFileSync("./data/guilds.json"));
		if (guilds.find((guildData) => guildData.id === guild.id)) return;
		guilds.push({
			id: guild.id,
			sendTo: null,
			count: 0,
			bot: false,
			system: false,
			history: [],
		});
		functions.writeFile("./data/guilds.json", guilds);
	},
};
