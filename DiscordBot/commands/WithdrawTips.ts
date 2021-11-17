import { Message } from 'discord.js';
import { Command } from '../Command';
import { Tipbot } from '../Tipbot';

export default class WithdrawTips extends Command {
    constructor() {
        const name = 'withdrawtips';
        const usage = '!withdrawtips [NEAR account id] [token id]';
        const description = 'Transfer your tips to balance of connected wallet or *Near account id*';

        super(name, usage, description);
    }

    public async run(message: Message, args: Array<string>): Promise<void> {
        let index: number = 0;
        let accountId: string | undefined = undefined;
        if (index < args.length && Tipbot.isValidAccountId(args[index])) {
            accountId = args[index];
            index++;
        }

        let tokenId: string = 'NEAR';
        if (index < args.length)
            tokenId = args[index];

        try {
            await Tipbot.getInstance().withdrawTips(message.author.id, accountId, tokenId);
            message.channel.send('Successfuly withdrew');
        } catch (e) {
            message.channel.send('Error: ' + (e as Error).message);
        }
    }
}
