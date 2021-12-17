import { Message } from 'discord.js';
import { Command } from '../Command';
import { Tipbot } from '../Tipbot';

export default class Withdraw extends Command {
    constructor() {
        const name = 'withdraw';
        const usage = '!withdraw [token id]';
        const description = 'Withdraw your balance to linked wallet';

        super(name, usage, description);
    }

    public async run(message: Message, args: Array<string>): Promise<void> {
        let tokenId: string = 'NEAR';
        if (args.length !== 0)
            tokenId = args[0];

        try {
            await Tipbot.getInstance().withdraw(message.author.id, tokenId);
            message.channel.send('Successfuly withdrew');
        } catch (e) {
            message.channel.send('Error: ' + (e as Error).message);
        }
    }
}
