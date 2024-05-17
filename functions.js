/* eslint-disable no-unused-vars */
import {
	Client,
	GuildMember,
	User,
	ChatInputCommandInteraction,
} from "discord.js";
import ping from "ping";
import fs from "node:fs";

export default {
	async googlePing() {
		return (await ping.promise.probe("8.8.8.8")).time;
	},
	/**
	 * @param {Client} client
	 * @returns
	 */
	async fetchAdmin(client) {
		return await client.users.fetch("606093171151208448");
	},
	/**
	 * @param {User} user
	 */
	avatarToURL(user) {
		return (
			user.avatarURL({ size: 4096 }) || `${user.defaultAvatarURL}?size=4096`
		);
	},
	/**
	 * @param {string} filePass
	 */
	writeFile(filePass, json) {
		fs.writeFileSync(filePass, Buffer.from(JSON.stringify(json)));
	},
	/**
	 * @param {Date} date
	 * @param {string} lang
	 */
	dateToString(date, time) {
		if (time) {
			const day = ["日", "月", "火", "水", "木", "金", "土"];
			return `${date.getFullYear()}年${
				date.getMonth() + 1
			}月${date.getDate()}日(${
				day[date.getDay()]
			}) ${date.getHours()}時${date.getMinutes()}分${date.getSeconds()}秒`;
		}
		const day = ["日", "月", "火", "水", "木", "金", "土"];
		return `${date.getFullYear()}年${
			date.getMonth() + 1
		}月${date.getDate()}日(${day[date.getDay()]})`;
	},
	/**
	 *
	 * @param {GuildMember} member
	 * @param {bigint} permission
	 * @param {string} permissionName
	 * @param {ChatInputCommandInteraction} interaction
	 */
	async hasThisMemberPermission(
		member,
		permission,
		permissionName,
		interaction,
	) {
		if (!member.permissions.has(permission)) {
			const content = `あなたの権限に ${permissionName} がありません。`;
			if (interaction.replied) {
				await interaction.editReply(content);
			} else if (interaction.deferred) {
				await interaction.followUp(content);
			} else {
				await interaction.reply(content);
			}
			return false;
		}
		return true;
	},
	/**
	 * @param {ChatInputCommandInteraction} interaction
	 */
	async isGuild(interaction) {
		if (!interaction.inGuild()) {
			await interaction.reply({
				content: "サーバー内でのみ実行できます。",
				ephemeral: true,
			});
			return false;
		}
		return true;
	},
};
