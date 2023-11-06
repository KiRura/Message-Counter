/* eslint-disable no-unused-vars */
import { Logger } from 'tslog'
import functions from '../functions.js'
import { Client, EmbedBuilder, Events } from 'discord.js'
import fs from 'fs'
import data from '../data.js'
import cron from 'node-cron'
const logger = new Logger({ hideLogPositionForProduction: true })

export default {
  name: Events.ClientReady,
  /**
   * @param {Client<true>} client
   * @param {*} registCommands
   */
  async execute (client, registCommands) {
    setInterval(async () => {
      client.user.setActivity({ name: `${(await client.guilds.fetch()).size} servers・${client.users.cache.size} users・${await functions.googlePing()} ms` })
    }, 30000)

    logger.info('finding no data generated guild...')
    for (const guild of (await client.guilds.fetch()).toJSON()) {
      const guildsData = JSON.parse(fs.readFileSync('./data/guilds.json'))
      if (!guildsData.find(guildData => guildData.id === guild.id)) {
        await (await import('../event/GuildCreate.js')).default.execute(client, guild)
        logger.info(`success: ${guild.name} | ${guild.id}`)
      }
    }

    cron.schedule('59 59 23 * * *', async () => {
      const d = new Date()
      const date = new Date(d.getFullYear(), d.getMonth(), d.getDate())
      const guildsData = JSON.parse(fs.readFileSync('./data/guilds.json'))
      for (const guildData of guildsData) {
        let guild
        let channel
        try {
          guild = await client.guilds.fetch(guildData.id)
          channel = await guild.channels.fetch(guildData.sendTo)
        } catch (error) {
          return
        }

        channel.send({
          embeds: [new EmbedBuilder()
            .setTitle(functions.dateToString(date, false))
            .setDescription(guildData.count)
            .setColor(data.mutaoColor)
          ]
        }).catch(_error => {})

        guildsData.find(guildData => guildData.id === guild.id).history.push({
          timestamp: date.getTime(),
          count: guildData.count
        })
        guildsData.find(guildData => guildData.id === guild.id).count = 0
      }

      functions.writeFile('./data/guilds.json', guildsData)
    })

    logger.info('setting commands...')
    await client.application.commands.set(registCommands)

    await (await (await client.guilds.fetch('1099309562781245440')).channels.fetch('1146562994688503999')).send({
      embeds: [
        new EmbedBuilder()
          .setTitle(`${client.user.displayName}が起動しました。`)
          .setFooter({ text: functions.dateToString(new Date(), true) })
          .setColor(data.mutaoColor)
      ]
    })

    logger.info(`${client.user.displayName} ALL READY`)
  }
}
