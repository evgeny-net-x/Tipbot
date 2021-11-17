import { Message } from 'discord.js';

export abstract class Command {
    public name: string;
    public usage: string;
    public description: string;

    constructor(name: string, usage: string, description: string) {
        this.name = name;
        this.usage = usage;
        this.description = description;
    }

    public abstract run(message: Message, args: string[]): Promise<void>;
}
