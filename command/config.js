/* eslint-disable no-unused-vars */
import { ChannelType, ChatInputCommandInteraction, Client, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import functions from '../functions.js'
import fs from 'fs'
import data from '../data.js'

export default {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('設定関連')
    .addSubcommand(command => command
      .setName('list')
      .setDescription('設定一覧')
    )
    .addSubcommand(command => command
      .setName('bot')
      .setDescription('BOTのメッセージをカウントに含める')
      .addBooleanOption(option => option
        .setName('boolean')
        .setDescription('有効にするか否か')
        .setRequired(true)
      )
    )
    .addSubcommand(command => command
      .setName('system')
      .setDescription('システムのメッセージをカウントに含める')
      .addBooleanOption(option => option
        .setName('boolean')
        .setDescription('有効にするか否か')
        .setRequired(true)
      )
    ),
  /**
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute (client, interaction) {
    if (!(await functions.isGuild(interaction))) return
    const guildsData = JSON.parse(fs.readFileSync('./data/guilds.json'))
    const guild = guildsData.find(guildData => guildData.id === interaction.guild.id)
    const subcommand = interaction.options.getSubcommand()

    if (subcommand === 'list') {
      await interaction.reply({
        embeds: [new EmbedBuilder()
          .setTitle('サーバー設定')
          .setFields([
            {
              name: '定期送信',
              value: guild.sendTo ? `<#${guild.sendTo}>` : 'False',
              inline: true
            },
            {
              name: 'BOTのメッセージをカウントに含める',
              value: guild.bot ? 'True' : 'False',
              inline: true
            },
            {
              name: 'システムのメッセージをカウントに含める',
              value: guild.system ? 'True' : 'False',
              inline: true
            }
          ])
          .setColor(data.mutaoColor)
        ]
      })
    } else if (subcommand === 'bot') {
      if (!(await functions.hasThisMemberPermission(interaction.member, PermissionFlagsBits.Administrator, '管理者'))) return
      const bot = interaction.options.getBoolean('boolean')
      guildsData.find(guildData => guildData.id === interaction.guild.id).bot = bot
      functions.writeFile('./data/guilds.json', guildsData)

      await interaction.reply({
        embeds: [new EmbedBuilder()
          .setTitle(bot ? '有効化' : '無効化')
          .setDescription('BOTのメッセージをカウントに含める')
          .setColor(bot ? data.greenColor : data.redColor)
        ]
      })
    } else if (subcommand === 'system') {
      if (!(await functions.hasThisMemberPermission(interaction.member, PermissionFlagsBits.Administrator, '管理者'))) return
      const system = interaction.options.getBoolean('boolean')
      guildsData.find(guildData => guildData.id === interaction.guild.id).system = system
      functions.writeFile('./data/guilds.json', guildsData)

      await interaction.reply({
        embeds: [new EmbedBuilder()
          .setTitle(system ? '有効化' : '無効化')
          .setDescription('システムのメッセージをカウントに含める')
          .setColor(system ? data.greenColor : data.redColor)
        ]
      })
    }
  }
}
