import { Message } from 'discord.js';
import { Command } from '../Command';
import { Tipbot } from '../Tipbot';

export default class Balance extends Command {
    constructor() {
        const name = 'balance';
        const usage = '!balance [token id]';
        const description = 'Get your balance on connected wallet';

        super(name, usage, description);
    }

    public async run(message: Message, args: Array<string>): Promise<void> {
        let tokenId: string = 'NEAR';
        if (args.length !== 0)
            tokenId = args[0];

        try {
            const balance: string = await Tipbot.getInstance().getBalance(message.author.id, tokenId);
            message.author.send('Your balance is **' + balance + '**');

            if (message.guildId !== null)
                message.channel.send('Check DM!');
        } catch (e) {
            message.channel.send('Error: ' + (e as Error).message);
        }
    }
}
