import functions from "../functions.js";
import { ActivityType, Client, EmbedBuilder, Events } from "discord.js";
import fs from "node:fs";
import data from "../data.js";
import { logger } from "../main.js";

export default {
	name: Events.ClientReady,
	/**
	 * @param {Client<true>} client
	 * @param {*} registCommands
	 */
	async execute(client, registCommands) {
		async function setAc() {
			client.user.setActivity({
				name: `${(await client.guilds.fetch()).size} servers・${
					client.users.cache.size
				} users・${await functions.googlePing()} ms`,
				type: ActivityType.Custom,
			});
		}

		await setAc();
		setInterval(async () => {
			await setAc();
		}, 30000);

		for (const guild of (await client.guilds.fetch()).toJSON()) {
			const guildsData = JSON.parse(fs.readFileSync("./data/guilds.json"));
			if (!guildsData.find((guildData) => guildData.id === guild.id)) {
				await (await import("../event/GuildCreate.js")).default.execute(guild);
				logger.info(`success: ${guild.name} | ${guild.id}`);
			}
		}

		logger.info("setting commands...");
		await client.application.commands.set(registCommands);

		await (
			await (
				await client.guilds.fetch("1099309562781245440")
			).channels.fetch("1146562994688503999")
		).send({
			embeds: [
				new EmbedBuilder()
					.setTitle(`${client.user.displayName}が起動しました。`)
					.setFooter({ text: functions.dateToString(new Date(), true) })
					.setColor(data.mutaoColor),
			],
		});

		logger.info(`${client.user.displayName} ALL READY`);
	},
};
