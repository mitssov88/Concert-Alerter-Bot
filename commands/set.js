const {SlashCommandBuilder} = require('@discordjs/builders')

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

module.exports = {
    data: new SlashCommandBuilder().setName('set').setDescription("Set your search settings for Ticketmaster")
        .addSubcommand(subcommand => 
        subcommand.setName("city").setDescription("Sets the city when searching for events")
        .addStringOption(option =>
            option.setName("city").setDescription("The city").setRequired(true)
        ))
        .addSubcommand(subcommand => 
            subcommand.setName("country").setDescription("Sets the country when searching for events. Ticketmaster must support searching the country!")
            .addStringOption(option =>
                option.setName("country").setDescription("The country").setRequired(true)
            ))
        ,
    async execute (client, interaction, settings) {
        if (interaction.options.getSubcommand() === "city"){
            var username = `${interaction.member.user.username}#${interaction.member.user.discriminator}`
            const guildMap = settings.get(interaction.member.guild.name)
            guildMap.get(username).city = interaction.options._hoistedOptions[0].value
            await interaction.reply(`City has been saved as ${city}!`)
        }
        if (interaction.options.getSubcommand() === "country"){
            var username = `${interaction.member.user.username}#${interaction.member.user.discriminator}`
            
            const guildMap = settings.get(interaction.member.guild.name)
            
            guildMap.get(username).country = Object.values(countryToCode).includes(guildMap.get(username).country) ? interaction.options._hoistedOptions[0].value : countryToCode[country]
            if (!guildMap.get(username).country) {
                await interaction.reply(`Invalid or unsupported country code entered. Resetting to default (Canada / CA)`)
                guildMap.get(username).country = 'CA'
            }
            else{
                await interaction.reply(`Country has been saved as ${guildMap.get(username).country}!\n**Note:** Ticketmaster only allows searching for events in a small group of countries.`)
            }
        }
    }
}