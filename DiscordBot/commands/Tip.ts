import { Message, User } from 'discord.js';
import { Command } from '../Command';
import { Tipbot } from '../Tipbot';

export default class Tip extends Command {
    constructor() {
        const name = 'tip';
        const usage = '!tip <@user1> [<@user2> ... <@userN>] <amount of tip> [ticker]';
        const description = 'Send tips to users';

        super(name, usage, description);
    }

    public async run(message: Message, args: Array<string>): Promise<void> {
        let recipientIds: Set<string> = new Set<string>();
        let index: number;

        for (index = 0; index < args.length; index++) {
            let matches: any = args[index].match(/<@!([0-9]+)>/);
            if (!matches || matches.length != 2)
                break;

            recipientIds.add(message.mentions.users.get(matches[1])!.id);
        }

        if (recipientIds.size === 0 || index >= args.length || !Tipbot.isValidTipAmount(args[index])) {
            message.channel.send('Incorrect command format: ' + this.usage);
            return;
        }

        const price: string = args[index];
        let ticker: string = '';
        index++;
        if (index < args.length)
            ticker = args[index];

        try {
            const failedIds: Map<string, string> = await Tipbot.getInstance().tip(message.author.id, Array.from(recipientIds), price, ticker);
            if (failedIds.size == 0) {
                message.channel.send('Successfuly tipped');
                return;
            }

            let output: string = 'Could not tip to:\n';
            failedIds.forEach((cause: string, id: string): any => {
                output += message.mentions.users.get(id)!.toString() + ': ' + cause + '\n';
            });

            message.channel.send(output);
        } catch (e) {
            message.channel.send('Error: ' + (e as Error).message);
        }
    }
}
