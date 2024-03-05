import { Events } from 'discord.js'
import fs from 'fs'
import functions from '../functions.js'

export default {
  name: Events.MessageCreate,
  async execute (message) {
    const guildsData = JSON.parse(fs.readFileSync('./data/guilds.json'))
    const guild = guildsData.find(guildData => guildData.id === message.guild.id)
    if (!guild.bot && message.author.bot) return
    if (!guild.system && message.system) return
    guildsData.find(guildData => guildData.id === message.guild.id).count++
    functions.writeFile('./data/guilds.json', guildsData)
  }
}
