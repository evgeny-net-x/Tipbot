import { Message } from 'discord.js';
import { Command } from '../Command';
import { Tipbot } from '../Tipbot';

export default class GetTips extends Command {
    constructor() {
        const name = 'tips';
        const usage = '!tips [token id]';
        const description = 'Get your not accepted tips';

        super(name, usage, description);
    }

    public async run(message: Message, args: Array<string>): Promise<void> {
        let tokenId: string = 'NEAR';
        if (args.length !== 0)
            tokenId = args[0];

        try {
            const balance: string = await Tipbot.getInstance().getTips(message.author.id, tokenId);
            message.author.send('Your tips are **' + balance + '**');

            if (message.guildId !== null)
                message.channel.send('Check DM!');
        } catch (e) {
            message.channel.send('Error: ' + (e as Error).stack);
        }
    }
}
