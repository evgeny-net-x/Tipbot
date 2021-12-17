import { MessageEmbed, Message } from 'discord.js';
import { Command } from '../Command';
import { Tipbot } from '../Tipbot';

export default class Deposit extends Command {
    constructor() {
        const name = 'deposit';
        const usage = '!deposit [ticker]';
        const description = 'Get link to fund balance';

        super(name, usage, description);
    }

    public async run(message: Message, args: Array<string>): Promise<void> {
        let ticker: string = 'NEAR';
        if (args.length !== 0)
            ticker = args[0];

        try {
            const accountId: string = await Tipbot.getInstance().deposit(message.author.id, ticker);
            const embed: any = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Fund deposit')
<<<<<<< HEAD
                .setURL('https://evgeny-net-x.github.io/Tipbot');
=======
                .setURL('https://evigore.github.io/Tipbot');
>>>>>>> gh-pages

            message.channel.send({embeds: [embed]});
        } catch (e) {
            message.channel.send('Error: ' + (e as Error).message);
        }
    }
}
