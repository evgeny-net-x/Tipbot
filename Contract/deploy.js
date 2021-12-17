const sh = require('shelljs');
const path = require('path');
//const calledFromDir = sh.pwd().toString();

sh.cd(__dirname);

const MASTER_ACCOUNT = 'net_x.testnet';
const TIPBOT_ACCOUNT = 'tipbot.' + MASTER_ACCOUNT;
const TIPTOKEN_ACCOUNT = 'tiptoken.' + MASTER_ACCOUNT;
const AUTH_ACCOUNT = 'auth.' + MASTER_ACCOUNT;
const LINKDROP_ACCOUNT = 'linkdrop.' + MASTER_ACCOUNT;

sh.exec(`near delete ${TIPBOT_ACCOUNT} ${MASTER_ACCOUNT}`);
sh.exec(`near create-account ${TIPBOT_ACCOUNT} --masterAccount ${MASTER_ACCOUNT} --initialBalance 50`);
sh.exec(`near deploy ${TIPBOT_ACCOUNT} target/wasm32-unknown-unknown/release/tipbot.wasm --initFunction 'new' --initArgs '{
    "master_account_id": "${MASTER_ACCOUNT}",
    "linkdrop_account_id": "${LINKDROP_ACCOUNT}",
    "auth_account_id": "${AUTH_ACCOUNT}",
    "tiptoken_account_id": "${TIPTOKEN_ACCOUNT}"
}'`);

sh.exec(`near call ${TIPBOT_ACCOUNT} whitelist_token '{"token_id": "near"}' --accountId ${MASTER_ACCOUNT}`);
sh.exec(`near call ${TIPBOT_ACCOUNT} whitelist_category '{"category": "telegram"}' --accountId ${MASTER_ACCOUNT}`);
sh.exec(`near call ${TIPBOT_ACCOUNT} whitelist_category '{"category": "discord"}' --accountId ${MASTER_ACCOUNT}`);
