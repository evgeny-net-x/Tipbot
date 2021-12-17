import { MessageEmbed, Client, Intents, Collection, IntentsString } from 'discord.js';
import { Command } from './Command';
import { join } from 'path';
import { readdir } from 'fs';
const config = require('./config.json');

require('dotenv').config();


const bot = new Client({ intents: Object.values(Intents.FLAGS) });

function initCommands(): Collection<string, Command> {
    const path = join(__dirname, 'commands');
    let commands: Collection<string, Command> = new Collection<string, Command>();

    readdir(path, (err, files) => {
        files.forEach(cmd => {
            const Command: any = require(`${path}/${cmd}`).default;
            const command = new Command();
            commands.set(command.name, command);
        });
    });

    return commands;
}

const commands: Collection<string, Command> = initCommands();

bot.on('messageCreate', (message) => {
    if (message.author.username != bot.user?.username && message.author.discriminator != bot.user?.discriminator) {
        const args = message.content.trim().split(/\s+/g);
        const name = args.shift()!.slice(config.prefix.length);

        const command = commands.get(name);
        if (command)
            command.run(message, args);
        else if (name === 'help' || name === 'commands') {
            let embed: MessageEmbed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle('List of commands');

            commands.forEach((value: Command): any => {
                embed.addField(value.name + ' - ' + value.description, 'Usage: ' + value.usage, false);
            });

            message.channel.send({ embeds: [embed] });
        }
    }
});

bot.login(process.env.DISCORD_BOT_TOKEN);
