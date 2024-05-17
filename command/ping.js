import {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	EmbedBuilder,
} from "discord.js";
import functions from "../functions.js";
import data from "../data.js";

export default {
	data: new SlashCommandBuilder().setName("ping").setDescription("ピンポン"),
	/**
	 * @param {ChatInputCommandInteraction} interaction
	 */
	async execute(interaction) {
		const googlePingResult = await functions.googlePing();
		const fetchAdminResult = await functions.fetchAdmin(client);
		const embed = new EmbedBuilder()
			.setTitle("Pong!")
			.setFields([
				{
					name: "WebSocket",
					value:
						interaction.client.ws.ping === -1
							? "none"
							: `${interaction.client.ws.ping} ms`,
					inline: true,
				},
				{
					name: "Ping Google (8.8.8.8)",
					value: `${googlePingResult} ms`,
					inline: true,
				},
				{
					name: "API Endpoint",
					value: "waiting...",
					inline: true,
				},
			])
			.setColor(data.mutaoColor)
			.setFooter({
				text: `Created by ${fetchAdminResult.displayName} (${fetchAdminResult.username})`,
				iconURL: functions.avatarToURL(fetchAdminResult),
			});

		await interaction.reply({ embeds: [embed] });
		interaction
			.fetchReply()
			.then(async (reply) => {
				embed.spliceFields(-1, 1).addFields({
					name: "API Endpoint",
					value: `${reply.createdTimestamp - interaction.createdTimestamp} ms`,
					inline: true,
				});
				if (!reply.editable) return;
				await interaction.editReply({ embeds: [embed] });
			})
			.catch((error) => {});
	},
};
