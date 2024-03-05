import { Client, Collection, EmbedBuilder, Events, GatewayIntentBits } from 'discord.js'
import { config } from 'dotenv'
import fs from 'fs'
import functions from './functions.js'
import data from './data.js'
import { Logger } from 'tslog'
import cron from 'node-cron'
const logger = new Logger({ hideLogPositionForProduction: true })
logger.info('loaded modules')

try {
  JSON.parse(fs.readFileSync('./data/guilds.json'))
} catch (error) {
  throw new Error('guilds.jsonが正しく配置、または書かれていません。')
}

config()

const client = new Client({ intents: Object.values(GatewayIntentBits) })

const eventCommands = new Collection()
const eventFiles = fs.readdirSync('./event').filter(eventFileName => eventFileName.endsWith('.js'))
for (const eventFileName of eventFiles) {
  try {
    const eventCommand = (await import(`./event/${eventFileName}`)).default
    eventCommands.set(eventCommand.name, eventCommand)
    logger.info(`loaded ${eventFileName}`)
  } catch (error) {
    logger.error(`cannot load ${eventFileName}`)
    console.error(error)
  }
}

const commands = new Collection()
const commandFiles = fs.readdirSync('./command').filter(commandFileName => commandFileName.endsWith('.js'))
const registCommands = []
for (const commandFileName of commandFiles) {
  try {
    const command = (await import(`./command/${commandFileName}`)).default
    commands.set(command.data.name, command)
    registCommands.push(command.data.toJSON())
    logger.info(`loaded ${commandFileName}`)
  } catch (error) {
    logger.error(`cannot load ${commandFileName}`)
    console.error(error)
  }
}

cron.schedule('59 59 23 * * *', async () => {
  const d = new Date()
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  let guildsData = JSON.parse(fs.readFileSync('./data/guilds.json'))
  for (const guildData of guildsData) {
    let guild
    let channel
    try {
      guild = await client.guilds.fetch(guildData.id)
      channel = await guild.channels.fetch(guildData.sendTo)
      await channel.send({
        embeds: [new EmbedBuilder()
          .setTitle(functions.dateToString(date, false))
          .setDescription(`${guildData.count}`)
          .setColor(data.mutaoColor)
        ]
      }).catch(_error => {})
    } catch (error) {

    }
    if (guild) {
      guildsData.find(guildData => guildData.id === guild.id).history.push({
        timestamp: date.getTime(),
        count: guildData.count
      })
      guildsData.find(guildData => guildData.id === guild.id).count = 0
    } else {
      guildsData = guildsData.filter(data => data.id !== guildData.id)
    }
  }

  functions.writeFile('./data/guilds.json', guildsData)
})

client.once(Events.ClientReady, async client => {
  const command = eventCommands.get(Events.ClientReady)
  try {
    await command.execute(client, registCommands)
  } catch (error) {
    logger.error('ClientReady Error')
    console.error(error)
  }
})

client.on(Events.GuildCreate, async guild => {
  const command = eventCommands.get(Events.GuildCreate)
  try {
    await command.execute(client, guild)
  } catch (error) {
    logger.error('GuildCreate Error')
    console.error(error)
  }
})

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return

  (await (await client.guilds.fetch('1074670271312711740')).channels.fetch('1171078075950321694')).send({
    embeds: [
      new EmbedBuilder()
        .setTitle(interaction.command.name)
        .setAuthor({
          name: `${interaction.user.displayName} | ${interaction.user.id}`,
          iconURL: functions.avatarToURL(interaction.user)
        })
        .setColor(interaction.member?.roles?.color?.color ? interaction.member.roles.color.color : data.mutaoColor)
        .setFooter({
          text: interaction.guild ? `${interaction.guild.name} | ${interaction.guild.id}` : 'DM',
          iconURL: interaction.inGuild() ? interaction.guild.iconURL({ size: 4096 }) : null
        })
    ]
  })

  const command = commands.get(interaction.command.name)
  if (!command) return await interaction.reply({ content: `${interaction.command.name}は未実装です。`, ephemeral: true })

  try {
    await command.execute(client, interaction)
  } catch (error) {
    logger.error(`InteractionCreate (${interaction.command.name}) Error`)
    console.error(error)
    await interaction.user.send(`エラーが発生しました。\n${error}`).catch(_error => {})
    await (await interaction.client.users.fetch('606093171151208448')).send(`誰かがinteractionエラーを吐いた\n${error}`)
  }
})

client.on(Events.MessageCreate, async message => {
  const command = eventCommands.get(Events.MessageCreate)
  try {
    await command.execute(message)
  } catch (error) {
    logger.error('MessageCreate Error')
    console.error(error)
    await (await message.client.users.fetch('606093171151208448')).send(`誰かがmessageCreateエラーを吐いた\n${error}`)
  }
})

client.login(process.env.DISCORD_TOKEN)
