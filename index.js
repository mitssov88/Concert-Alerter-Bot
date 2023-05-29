require("dotenv").config()

const { REST } = require("@discordjs/rest")
const { Routes } = require('discord-api-types/v9')
const { Client, Intents,  Collection } = require("discord.js")
const axios = require("axios");
const apiUrl = 'https://app.ticketmaster.com/discovery/v2/events';
const apiKey = 'K7egniG88aoFqoHTfne7tsoc1nPHo2Ty';


const fs = require("node:fs")
const path = require("node:path")

const countryToCode = {
  "United States": "US",
  "US": "US",
  "United States of America": "US",
  "USA": "US",
  "Canada": "CA",
  "CA": "CA",
  "United Kingdom": "GB",
  "UK": "GB",
  "Germany": "DE",
  "France": "FR",
  "Australia": "AU",
  "Spain": "ES",
  "Italy": "IT",
  "Netherlands": "NL",
  "Belgium": "BE",
  "Sweden": "SE",
  "Mexico": "MX",
  "Argentina": "AR",
  "Brazil": "BR",
  "Chile": "CL",
  "Colombia": "CO",
  "Costa Rica": "CR",
  "Ecuador": "EC",
  "Ireland": "IE",
  "New Zealand": "NZ",
  "Peru": "PE",
  "Puerto Rico": "PR",
  "South Africa": "ZA",
  "Switzerland": "CH",
  "United Arab Emirates": "AE"
}

const client = new Client({
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
    intents: [ 
        Intents.FLAGS.GUILDS,  
        Intents.FLAGS.DIRECT_MESSAGES,  
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_VOICE_STATES
        
      ]});
    

var allSettings = new Map()

const commands = []
client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands")
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles){
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

client.on("ready", async () => {
    const guild_ids = client.guilds.cache.map(guild => guild.id)
    const rest = new REST({version: '9'}).setToken(process.env.TOKEN);

    for (const guildID of guild_ids) {
        rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, guildID), {
          body: commands
        }).then(() => console.log(`Added commmands to ${guildID}`)).catch(console.error)

        const guild = await client.guilds.fetch(guildID);
        const guildSettings = new Map();
        try {
          await guild.members.fetch();
          guild.members.cache.each((member) => {
            const def = { country: 'CA', city: 'Toronto' };
            guildSettings.set(member.user.tag, def);
          });
          allSettings.set(guild.name, guildSettings);
        } catch (error) {
          console.error(`Error fetching members for guild ${guild.name}:`, error);
        }
      }
})

client.on('presenceUpdate', (oldMember, newMember) => {
    if (!newMember.user.bot && newMember.status != 'offline') {
        if (newMember.activities && newMember.activities[0] && newMember.activities[0].name == "Spotify"){
            const artists = newMember.activities[0].state.split("; ")
            const username = `${newMember.user.username}#${newMember.user.discriminator}`
            const theGuild = newMember.guild.name

            const guildMap = allSettings.get(theGuild)
            artists.forEach(artist => {
                axios.get(apiUrl, {
                    params: {
                      apikey: apiKey, 
                      countryCode: Object.values(countryToCode).includes(guildMap.get(username).country) ? guildMap.get(username).country : countryToCode[guildMap.get(username).country], // "CA", // or US
                      city: guildMap.get(username).city,
                      keyword: artist
                    }
                  })
                    .then(response => {
                      if (response.data._embedded && response.data._embedded.events){
                        if (response.data._embedded.events[0]._embedded.attractions[0].name === artist){
                          newMember.user.send(`Good news!\n**${artist}** has an event coming soon! \n${response.data._embedded.events[0].url}`);
                        }
                        else{
                          newMember.user.send(`Found an event that shared some keywords!\n${response.data._embedded.events[0].url}`);                        
                        }
                        newMember.user.send(`Price of a ticket starts at ${response.data._embedded.events[0].priceRanges[0].min} ${response.data._embedded.events[0].priceRanges[0].currency}`)

                        // TODO:
                        // 1. Keep track of which artists have already been mentioned TODAY?
                        // New Command: favourites (check every day)
                      }
                    })
                    .catch(error => {
                      console.error(error);
                    });
            });
        }
    }
})

client.on("interactionCreate", async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName)

    if (!command) return;

    try{
        if (interaction.commandName == 'ping'){
          await command.execute(interaction);
        }
        else {
          await command.execute(client, interaction, allSettings);
        }
    }
    catch(e){
        console.error(e);
        await interaction.reply("Error occurred when executing command.")
    }
})

client.login(process.env.TOKEN)