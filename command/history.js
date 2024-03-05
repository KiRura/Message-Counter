/* eslint-disable no-unused-vars */
import { SlashCommandBuilder, ChatInputCommandInteraction, Client, EmbedBuilder } from 'discord.js'
import fs from 'fs'
import functions from '../functions.js'
import data from '../data.js'

export default {
  data: new SlashCommandBuilder()
    .setName('history')
    .setDescription('メッセージカウントの履歴')
    .addIntegerOption(option => option
      .setName('page')
      .setDescription('ページ数')
      .setMinValue(1)
    ),
  /**
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute (client, interaction) {
    if (!(await functions.isGuild(interaction))) return

    const page = interaction.options.getInteger('page') || 1
    const guildsData = JSON.parse(fs.readFileSync('./data/guilds.json'))
    const guild = guildsData.find(guildData => guildData.id === interaction.guild.id)
    if (guild.history.length === 0) return await interaction.reply('データがひとつもありませんでした。')
    const maxpages = (Math.floor(guild.history.length / 10)) + 1
    if (maxpages < page) return await interaction.reply({ content: `${maxpages}ページまで指定できます`, ephemeral: true })
    const pageStart = 10 * (page - 1)
    const pageEnd = pageStart + 10
    const history = guild.history.reverse().slice(pageStart, pageEnd).map(data => {
      return `${functions.dateToString(new Date(Number(data.timestamp)))}: ${data.count}`
    })

    await interaction.reply({
      embeds: [new EmbedBuilder()
        .setTitle('過去のデータ')
        .setDescription(`- ${history.join('\n- ')}${guild.history.length > 10 ? `\n\n残り: ${guild.history.length - 10}日分` : ''}`)
        .setFooter({ text: `${page} / ${maxpages} ページ` })
        .setColor(data.mutaoColor)
      ]
    })
  }
}
