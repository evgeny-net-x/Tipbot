import * as NearAPI from 'near-api-js';

import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig';
import { join } from 'path';
const config = require('./config.json');


type DbRecord = {
    accountId: string,
    confirmed: boolean
}

type DbData = Record<string, DbRecord>

export class Tipbot { // is singleton
    private readonly NEAR_MASTER_ACCOUNT: string = 'net_x.testnet';
    private readonly NETWORK: string = 'testnet';
<<<<<<< HEAD
    private readonly PREFIX: string = 'DIS'; // Prefix is DIS or TEL
=======
    private readonly CATEGORY: string = 'discord';
>>>>>>> gh-pages
    private readonly TOKENS: Set<string> = new Set(['NEAR']);

    private static instance: Tipbot = new Tipbot();
    private defaultKeyStore: NearAPI.keyStores.KeyStore;
    private sessionKeyStore: NearAPI.keyStores.KeyStore;
    private db: JsonDB;

    private constructor() {
        this.defaultKeyStore = this.getDefaultKeyStore();
        this.sessionKeyStore = this.getSessionKeyStore();
        this.db = new JsonDB(new Config("db", true, false, '/'));
    }

    public static getInstance(): Tipbot {
        return Tipbot.instance;
    }

    public async connectNear(userId: string, accountId: string): Promise<string> {
        await this.removeConnectedWallet(userId);

        // TODO: other users shouln't be able to change keypair of user

        const account: any = await this.getNearAccountByAccountId(accountId, this.sessionKeyStore);
        const keyPair: any = NearAPI.KeyPair.fromRandom("ed25519");
        const publicKey: string = keyPair.publicKey.toString();

        this.sessionKeyStore.setKey(this.NETWORK, accountId, keyPair);
        this.db.push('/' + userId, { accountId, confirmed: false });

        const title: string = 'CollabLand Tipbot';
        const contractId = 'tipbot.' + this.NEAR_MASTER_ACCOUNT;
<<<<<<< HEAD
        const successUrl = 'https://evgeny-net-x.github.io/Tipbot/';
=======
        const successUrl = 'https://evigore.github.io/Tipbot/';
>>>>>>> gh-pages

        const connectUrl: string = `https://wallet.testnet.near.org/login/?title=${title}&public_key=${publicKey}&contract_id=${contractId}&success_url=${successUrl}`;
        return encodeURI(connectUrl);
    }

    private async removeConnectedWallet(userId: string): Promise<void> {
        const wallet: DbRecord | null = await this.getConnectedWalletWithoutConfirmation(userId)!;
        if (wallet === null)
            return;

        const keyPair: any = await this.sessionKeyStore.getKey(this.NETWORK, wallet.accountId);
<<<<<<< HEAD
=======
        if (keyPair === null) // TODO: recheck
            return;

>>>>>>> gh-pages
        const publicKey: string = keyPair.publicKey.toString();
        const account: NearAPI.Account = await this.getNearAccountByAccountId(wallet.accountId, this.sessionKeyStore);

        this.sessionKeyStore.removeKey(this.NETWORK, wallet.accountId);
    }

    private getSessionKeyStore(): NearAPI.keyStores.KeyStore {
        const homedir: string = require("os").homedir();
        const CREDENTIALS_DIR: string = ".near-credentials/discord_sessions";

        const credentialsPath: string = join(homedir, CREDENTIALS_DIR);
        const keyStore: NearAPI.keyStores.KeyStore = new NearAPI.keyStores.UnencryptedFileSystemKeyStore(credentialsPath);

        return keyStore;
    }

     private getDefaultKeyStore(): NearAPI.keyStores.KeyStore {
        const homedir: string = require("os").homedir();
        const CREDENTIALS_DIR: string = ".near-credentials";

        const credentialsPath: string = join(homedir, CREDENTIALS_DIR);
        const keyStore: NearAPI.keyStores.KeyStore = new NearAPI.keyStores.UnencryptedFileSystemKeyStore(credentialsPath);

        return keyStore;
    }



    private getConfigByKeyStore(keyStore: NearAPI.keyStores.KeyStore): NearAPI.ConnectConfig {
        const config = {
            networkId: this.NETWORK,
            keyStore,
            nodeUrl:     "https://rpc."      + this.NETWORK + ".near.org",
            walletUrl:   "https://wallet."   + this.NETWORK + ".near.org",
            helperUrl:   "https://helper."   + this.NETWORK + ".near.org",
            explorerUrl: "https://explorer." + this.NETWORK + ".near.org",
        };

        return config;
    }

    private async getNearAccountByAccountId(accountId: string, keyStore: NearAPI.keyStores.KeyStore): Promise<NearAPI.Account> {
        const config = this.getConfigByKeyStore(keyStore);
        const near: NearAPI.Near = await NearAPI.connect(config);

        return await near.account(accountId);
    }

    private async getMasterAccount(): Promise<NearAPI.Account> {
<<<<<<< HEAD
        return await this.getNearAccountByAccountId(this.NEAR_MASTER_ACCOUNT, this.defaultKeyStore);
=======
        const keyStore = new NearAPI.keyStores.InMemoryKeyStore();
        const accountId: any = process.env.NEAR_MASTER_ACCOUNT_PRIVATE_KEY!;
        const keyPair = NearAPI.KeyPair.fromString(accountId);
        await keyStore.setKey("testnet", this.NEAR_MASTER_ACCOUNT, keyPair);

        const config = this.getConfigByKeyStore(keyStore);
        const near: NearAPI.Near = await NearAPI.connect(config);
        return await near.account(this.NEAR_MASTER_ACCOUNT);
>>>>>>> gh-pages
    }

    public async getTips(userId: string, tokenId: string = 'NEAR'): Promise<string> {
        // get_balance(TelegramAccountId, token_id) for telegram user
        
        const contract: any = this.getContract(await this.getMasterAccount());

        try {
<<<<<<< HEAD
            const yocto: string = await contract.get_balance({telegram_account: Number(userId)}); // TODO: telegram to discord
=======
            const yocto: string = await contract.get_balance({
                contact: {
                    category: this.CATEGORY,
                    user_id: Number(userId)
                }
            });
>>>>>>> gh-pages
            return NearAPI.utils.format.formatNearAmount(yocto)!;
        } catch (e) {
            this.handleNearError(e);
        }
    }

    public async getBalance(userId: string, tokenId: string = 'NEAR'): Promise<string> {
        // get_deposit(account_id: ValidAccountId, token_id) for linked wallet

        const contract: any = await this.getContractOfUser(userId);
        try {
            const yocto: string = await contract.get_deposit({account_id: contract.account.accountId});
            return NearAPI.utils.format.formatNearAmount(yocto)!;
        } catch (e) {
            this.handleNearError(e);
        }
    }

    public async deposit(userId: string, tokenId: string = 'NEAR'): Promise<string> {
        // deposit() пополняет deposits = map(accountId => balance)
        //tokenId = this.checkTokenIdExistence(tokenId);
        //await this.checkDepositAccountExistence(userId);

        const wallet: DbRecord | null = await this.getConnectedWallet(userId);
        if (wallet === null)
            throw new Error('before fund the balance, you need to connect the wallet!');

        return wallet.accountId;
    }

    public async withdrawTips(userId: string, withdrawAccount?: string, tokenId?: string) {
        // transfer_tips_to_deposit(TelegramAccountId, receiver_account_id, token_id) master. All tips of user transfer to accountId
        
        if (withdrawAccount === undefined) {
            const wallet: DbRecord | null = await this.getConnectedWallet(userId);
            if (wallet === null)
                throw new Error('before withdraw the tips, you need to connect the wallet!');

            withdrawAccount = wallet.accountId;
        }

        const account: NearAPI.Account = await this.getMasterAccount();
        const contract: any = this.getContract(account);

        try {
<<<<<<< HEAD
            await contract.transfer_tips_to_deposit({telegram_account: Number(userId), account_id: withdrawAccount});
=======
            await contract.transfer_tips_to_deposit({
                contact: {
                    category: this.CATEGORY,
                    user_id: Number(userId)
                },
                account_id: withdrawAccount
            });
>>>>>>> gh-pages
        } catch (e) {
            this.handleNearError(e);
        }
    }

    private handleNearError(e: any): never {
        if (e.type === 'FunctionCallError')
            throw new Error(e.kind.ExecutionError.split("'")[1]);
        else if (e.type === 'UntypedError')
            throw new Error('something went wrong!');
        else
            throw new Error(e.type);
    }

    public async withdraw(userId: string, tokenId: string = 'NEAR'): Promise<void> {
        // withdraw(token_id) withdraw from master_acc balance to caller account

        const account: NearAPI.Account = await this.getMasterAccount();
        const contract: any = this.getContract(account);

        try {
            await contract.withdraw({});
        } catch (e) {
            this.handleNearError(e);
        }
    }

    public async tip(userId: string, recipientIds: Array<string>, amount: string, tokenId: string = 'NEAR'): Promise<Map<string, string>> {
<<<<<<< HEAD
        //send_tip_to_telegram(TelegramAccountId, amount, Option<TelegramChatId>, Option<TokenAccountId>)  // пересылает с кошелька на телеграм аккаунт (пополняет telegram_tips = map(userId => balance))
=======
        //send_tip_to_contact(Contact, amount, Option<TelegramChatId>, Option<TokenAccountId>)  // пересылает с кошелька на телеграм аккаунт (пополняет telegram_tips = map(userId => balance))
>>>>>>> gh-pages

        tokenId = this.checkTokenIdExistence(tokenId);
        const contract: any = await this.getContractOfUser(userId);
        amount = NearAPI.utils.format.parseNearAmount(amount)!;

        let failedIds: Map<string, string> = new Map<string, string>();
        for (const id of recipientIds) {
            try {
<<<<<<< HEAD
                await contract.send_tip_to_telegram({
                    telegram_account: Number(id),
=======
                await contract.send_tip_to_contact({
                    contact: {
                        category: this.CATEGORY,
                        user_id: Number(id)
                    },
>>>>>>> gh-pages
                    amount: amount
                });
            } catch (e) {
                this.handleNearError(e);
            }
        }

        return failedIds;
    }

    private async getContractOfUser(userId: string): Promise<any> {
        const wallet: DbRecord | null = await this.getConnectedWallet(userId);
        if (wallet === null)
            throw new Error('before receiving the balance, you need to connect the wallet!');

        const account: NearAPI.Account = await this.getNearAccountByAccountId(wallet.accountId, this.sessionKeyStore);

        return this.getContract(account);
    }

    public static isValidAccountId(id: string): boolean {
        const parts: string[] = id.split('.');
        return (parts[parts.length-1] === 'near' || parts[parts.length-1] === 'testnet');
    }

    public static isValidTipAmount(n: any): boolean {
        return !isNaN(+n);
    }

    private checkTokenIdExistence(tokenId_: string): string {
        let tokenId: string = tokenId_.toUpperCase();
        if (!this.TOKENS.has(tokenId))
            tokenId = 'NEAR';

        return tokenId;
    }

    private getContract(account: NearAPI.Account): NearAPI.Contract {
        const contract = new NearAPI.Contract(account, config.contract_name, {
            viewMethods: ['get_deposit', 'get_balance'],
<<<<<<< HEAD
            changeMethods: ['deposit', 'withdraw', 'transfer_tips_to_deposit', 'send_tip_to_telegram']
=======
            changeMethods: ['deposit', 'withdraw', 'transfer_tips_to_deposit', 'send_tip_to_contact']
>>>>>>> gh-pages
        });

        return contract;
    }

    private async getConnectedWallet(userId: string): Promise<DbRecord | null> {
        if (!this.db.exists('/' + userId))
            return null;

        let record: DbRecord = this.db.getObject<DbRecord>('/' + userId)!;
<<<<<<< HEAD
        console.log(record.confirmed);
=======
>>>>>>> gh-pages
        if (!record.confirmed) {
            const account: NearAPI.Account = await this.getNearAccountByAccountId(record.accountId, this.sessionKeyStore);
            const keys: Array<any> = await account.getAccessKeys();
            for (const key of keys) {
                if (key.access_key.permission === 'FullAccess')
                    continue;

                if (key.access_key.permission.FunctionCall.receiver_id !== ('tipbot.' + this.NEAR_MASTER_ACCOUNT))
                    continue;

                const keyPair: any = await this.sessionKeyStore.getKey(this.NETWORK, record.accountId);
                const publicKey: string = keyPair.publicKey.toString();
                if (key.public_key !== publicKey)
                    continue;

                record.confirmed = true;
                this.db.push('/' + userId, record);
                return record;
            }

            return null;
        }

        return record;
    }

    private async getConnectedWalletWithoutConfirmation(userId: string): Promise<DbRecord | null> {
        if (!this.db.exists('/' + userId))
            return null;

        let record: DbRecord = this.db.getObject<DbRecord>('/' + userId)!;
        return record;
    }

}
