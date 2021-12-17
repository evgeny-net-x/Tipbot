import {connect, Contract, keyStores, WalletConnection} from 'near-api-js'
import getConfig from './config'
import appSettings from './app-settings'

const nearConfig = getConfig(appSettings.NODE_ENV)

export async function initContract() {
    const near = await connect(Object.assign({deps: {keyStore: new keyStores.BrowserLocalStorageKeyStore()}}, nearConfig))

    window.walletConnection = new WalletConnection(near)
    window.accountId = window.walletConnection.getAccountId()
    window.contract = await new Contract(window.walletConnection.account(), nearConfig.contractName, {
        viewMethods: ['get_deposit'],
        changeMethods: ['deposit', 'withdraw'],
    })

    window.token_contracts = [];

    const methods = {
        viewMethods: ['ft_balance_of', 'storage_balance_of'],
        changeMethods: [],
    };

    const erc20 = [
        {"name": "USDT", "address": "0xdac17f958d2ee523a2206206994597c13d831ec7", "decimals": 6},
        {"name": "UNI", "address": "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984", "decimals": 18},
        {"name": "LINK", "address": "0x514910771af9ca656af840dff83e8264ecf986ca", "decimals": 18},
        {"name": "USDC", "address": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", "decimals": 6},
        {"name": "WBTC", "address": "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", "decimals": 8},
        {"name": "AAVE", "address": "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9", "decimals": 18},
        {"name": "CRO", "address": "0xa0b73e1ff0b80914ab6fe0444e65848c4c34450b", "decimals": 8},
        {"name": "FTT", "address": "0x50d1c9771902476076ecfc8b2a83ad6b9355a4c9", "decimals": 18},
        {"name": "BUSD", "address": "0x4fabb145d64652a948d72533023f6e7a623c7c53", "decimals": 18},
        {"name": "HT", "address": "0x6f259637dcd74c767781e37bc6133cd6a68aa161", "decimals": 18},
        {"name": "DAI", "address": "0x6b175474e89094c44da98b954eedeac495271d0f", "decimals": 18},
        {"name": "SUSHI", "address": "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2", "decimals": 18},
        {"name": "SNX", "address": "0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f", "decimals": 18},
        {"name": "GRT", "address": "0xc944e90c64b2c07662a292be6244bdf05cda44a7", "decimals": 18},
        {"name": "MKR", "address": "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2", "decimals": 18},
        {"name": "COMP", "address": "0xc00e94cb662c3520282e6f5717214004a7f26888", "decimals": 18},
        {"name": "YFI", "address": "0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e", "decimals": 18},
        {"name": "WETH", "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", "decimals": 18},
        {"name": "HBTC", "address": "0x0316eb71485b0ab14103307bf65a021042c6d380", "decimals": 18},
        {"name": "1INCH", "address": "0x111111111117dc0aa78b770fa6a738034120c302", "decimals": 18}
    ];

    window.tokens = {};
    erc20.map(token => window.tokens[token.name] = {address: token.address.substring(2), decimals: token.decimals});

    const AddContractWithPromise = async key => { //a function that returns a promise
        window.token_contracts[key] = await new Contract(
            window.walletConnection.account(),
            getContractAddress(window.tokens[key].address), methods);
        return Promise.resolve('ok')
    };


    const AddContract = async key => {
        return AddContractWithPromise(key)
    }

    const setTokenContracts = async () => {
        return Promise.all(Object.keys(window.tokens).map(key => AddContract(key)))
    };

    await setTokenContracts().then(data => {
        console.log(window.token_contracts);
    })
}

export function getContractAddress(token_address) {
    return token_address + ".factory.bridge.near";
}

export function logout() {
    window.walletConnection.signOut()
    window.location.replace(window.location.origin + window.location.pathname)
}

export function login() {
    window.walletConnection.requestSignIn(nearConfig.contractName, appSettings.appNme)
}
