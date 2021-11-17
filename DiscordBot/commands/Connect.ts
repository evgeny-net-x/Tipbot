import { MessageEmbed, Message } from 'discord.js';
import { Command } from '../Command';
import { Tipbot } from '../Tipbot';

export default class Connect extends Command {
    constructor() {
        const name = 'connect';
        const usage = '!connect <NEAR account id>';
        const description = 'Connect NEAR account to the messanger';

        super(name, usage, description);
    }

    public async run(message: Message, args: Array<string>): Promise<void> {
        if (args.length === 0) {
            message.channel.send('Account id argument is missing: ' + this.usage);
            return;
        }

        const accountId: string = args[0];
        if (!Tipbot.isValidAccountId(accountId)) {
            message.channel.send('Incorrect account id format: ' + this.usage);
            return;
        }

        try {
            const connectUrl: string = await Tipbot.getInstance().connectNear(message.author.id, accountId);
            const embed: any = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Connect your NEAR wallet')
                .setURL(connectUrl);

            message.author.send({embeds: [embed]});

            if (message.guildId !== null)
                message.channel.send('Check DM!');
        } catch (e) {
            console.log((e as Error));
            message.channel.send('Error: ' + (e as Error).message);
        }
    }
}
