import {
	ChatInputCommandInteraction,
	EmbedBuilder,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from "discord.js";
import functions from "../functions.js";
import fs from "node:fs";
import data from "../data.js";

export default {
	data: new SlashCommandBuilder()
		.setName("resetcount")
		.setDescription("カウントをリセットする"),
	/**
	 * @param {ChatInputCommandInteraction} interaction
	 */
	async execute(interaction) {
		if (!(await functions.isGuild(interaction))) return;
		if (
			!(await functions.hasThisMemberPermission(
				interaction.member,
				PermissionFlagsBits.Administrator,
				"管理者",
			))
		)
			return;

		const guildsData = JSON.parse(fs.readFileSync("./data/guilds.json"));
		const beforeCount = guildsData.find(
			(guildData) => guildData.id === interaction.guild.id,
		).count;
		guildsData.find(
			(guildData) => guildData.id === interaction.guild.id,
		).count = 0;
		functions.writeFile("./data/guilds.json", guildsData);

		await interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle("カウントのリセットが完了しました。")
					.setDescription(`リセット前: ${beforeCount}`)
					.setColor(data.greenColor),
			],
		});
	},
};
