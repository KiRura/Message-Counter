/* eslint-disable no-unused-vars */
import { ChannelType, ChatInputCommandInteraction, Client, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import functions from '../functions.js'
import fs from 'fs'
import data from '../data.js'

export default {
  data: new SlashCommandBuilder()
    .setName('setchannel')
    .setDescription('カウントを日本時間0時に定期送信するチャンネルを指定')
    .addChannelOption(option => option
      .setName('channel')
      .setDescription('送信先のチャンネル | 空白で無効化')
      .addChannelTypes(ChannelType.GuildText, ChannelType.PublicThread, ChannelType.PrivateThread)
    ),
  /**
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   * @returns
   */
  async execute (client, interaction) {
    if (!(await functions.isGuild(interaction))) return
    if (!(await functions.hasThisMemberPermission(interaction.member, PermissionFlagsBits.Administrator, '管理者'))) return

    const channel = interaction.options.getChannel('channel')?.id || null
    const guildsData = JSON.parse(fs.readFileSync('./data/guilds.json'))
    guildsData.find(guildData => guildData.id === interaction.guild.id).sendTo = channel
    functions.writeFile('./data/guilds.json', guildsData)

    await interaction.reply({
      embeds: [new EmbedBuilder()
        .setTitle(channel ? '有効化' : '無効化')
        .setDescription(`定期送信${channel ? `先:\n<#${channel}>` : ''}`)
        .setColor(channel ? data.greenColor : data.redColor)
      ]
    })
  }
}
