# Concert-Alerter-Bot
Over the years, I've missed out on seeing some of my favourite artists simply because I didn't know they had an event scheduled in my area. After watching my brother in physical pain for a couple days this summer from missing the opportunity to buy tickets and see some of his favourite rappers, I decided to finally make a Discord bot that would help us out.

This bot sends a Ticketmaster link, as well as the minimum ticket price, to you on Discord if it finds that the artist(s) you're currently listening to on Spotify has an event/concert scheduled in your set area in the next year.

My brother and I have gotten in the habit of running this bot locally every month or so to keep us updated on what artists are performing.

## To make your own instance of this bot:
1. Register a custom bot with Discord, give it admin privileges, as well as the ```bot``` and ```application.commands``` scopes
2. Invite it to one of your Discord servers
3. Set the ```TOKEN``` and ```CLIENT_ID``` fields of your Discord bot in the ```.env``` file
4. Run the code locally with ```node index.js```
5. If needed, change your location with the ```/set``` command
