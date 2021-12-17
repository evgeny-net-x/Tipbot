import 'regenerator-runtime/runtime'
import React from 'react'
import {login, logout, getContractAddress} from './js/utils'
import * as nearAPI from 'near-api-js'
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import {BN} from 'bn.js'
import './css/global.css'
import './css/app.css'
import {useDetectOutsideClick} from "./js/useDetectOutsideClick";

import getConfig from './js/config'
import appSettings from './js/app-settings'

const config = getConfig(appSettings.NODE_ENV);
const FRAC_DIGITS = 5;
const defaultFT = "USDT";

console.log(appSettings.NODE_ENV);

export default function App() {
    const [buttonDisabled, setButtonDisabled] = React.useState(false)
    const [showNotification, setShowNotification] = React.useState(false)

    const [token, setToken] = React.useState(defaultFT)
    const [tokenBalance, setTokenBalance] = React.useState(0)
    const [storageBalance, setStorageBalance] = React.useState({});

    const navDropdownRef = React.useRef(null);
    const [isNavDropdownActive, setIsNaVDropdownActive] = useDetectOutsideClick(navDropdownRef, false);

    /* APP STATE */
    const [input, setInput] = React.useState(5);
    const [deposit, setDeposit] = React.useState(0);
    const [showWithdraw, setShowWithdraw] = React.useState(false)

    /* APP */
    const GetDeposit = async () => {
        const deposit = await window.contract.get_deposit({
            account_id: window.accountId
        });
        setShowWithdraw(deposit > 0);
        const depositFormatted = nearAPI.utils.format.formatNearAmount(deposit, FRAC_DIGITS);
        setDeposit(depositFormatted);
        return depositFormatted;
    };

    const inputChange = (value) => {
        setInput(value);
        setButtonDisabled(!parseFloat(value) || parseFloat(value) < 0);
    };

    const AppContent = () => {
        return (
        <div>
            <Header/>
            <main>
                <div className="background-img"/>
                <h1>
                    NEAR Tips
                </h1>
                <form onSubmit={async event => {
                    event.preventDefault()

                    const {fieldset} = event.target.elements;
                    const newDeposit = input;

                    if (parseFloat(newDeposit) > 0) {
                        fieldset.disabled = true

                        try {
                            await window.contract.deposit({}, 300000000000000, ConvertToYoctoNear(newDeposit))
                        } catch (e) {
                            ContractCallAlert();
                            throw e
                        } finally {
                            fieldset.disabled = false
                        }

                        setDeposit(newDeposit)
                        setShowNotification({method: "call", data: "deposit"});
                        setTimeout(() => {
                            setShowNotification(false)
                        }, 11000)
                    }
                }}>
                    <fieldset id="fieldset">
                        <label
                            htmlFor="deposit"
                            style={{
                                display: 'block',
                                color: 'var(--gray)',
                                marginBottom: '0.5em'
                            }}
                        >
                            Deposit tokens to the app and you will be able to send tips in telegram:
                        </label>
                        <div style={{display: 'flex'}}>
                            <input
                                autoFocus
                                autoComplete="off"
                                defaultValue={input}
                                id="deposit"
                                onChange={e => inputChange(e.target.value)}
                                style={{flex: 1}}
                            />
                            <button
                                disabled={buttonDisabled}
                                style={{borderRadius: '0 5px 5px 0'}}
                            >
                                Deposit
                            </button>
                        </div>
                    </fieldset>
                </form>
                <div className="actions">
                    {showWithdraw && <button
                        style={{borderRadius: '5px'}}
                        onClick={async event => {
                            try {
                                // make an update call to the smart contract
                                await window.contract.withdraw({}, 300000000000000)
                            } catch (e) {
                                ContractCallAlert();
                                throw e
                            }

                            setShowNotification({method: "call", data: "withdraw"})

                            setTimeout(() => {
                                setShowNotification(false)
                            }, 11000)

                            await GetDeposit()
                        }
                        }
                    >
                        Withdraw
                    </button>}
                </div>


            </main>
            {showNotification && Object.keys(showNotification) &&
            <Notification method={showNotification.method} data={showNotification.data}/>}
        </div>
    );
}

const dropdownOptions = Object.keys(window.tokens);

const ChangeToken = async (token) => {
    await get_balance(token);
    await get_storage(token);
};

const get_storage = (token) => {
    window.token_contracts[token].storage_balance_of({
        account_id: window.accountId
    })
        .then(storage_balance => {
            setStorageBalance(storage_balance);
        });

    setToken(token);
}

const get_balance = (token) => {
    window.token_contracts[token].ft_balance_of({
        account_id: window.accountId
    })
        .then(balance => {
            console.log(`Balance of ${token} (${window.tokens[token].address}) is ${balance}`)
            balance = balance / Math.pow(10, window.tokens[token].decimals);
            setTokenBalance(balance);
        });

    setToken(token);
}

const StorageBalance = () => {
    return storageBalance ?
        <div>Storage balance found. Total: {nearAPI.utils.format.formatNearAmount(storageBalance.total, FRAC_DIGITS)},
            Unbonded: {nearAPI.utils.format.formatNearAmount(storageBalance.available, FRAC_DIGITS)}.</div>
        : <div>Storage balance not found</div>
};

/* HEADER */
const Header = () => {
    return <div className="nav-container">
        <div className="nav-header">
            <NearLogo/>
            <div className="nav-item user-name">{window.accountId}</div>
            <Deposit/>
            <div className="nav align-right">
                <NavMenu/>
                <div className="account-sign-out">
                    <button className="link" style={{float: 'right'}} onClick={logout}>
                        Sign out
                    </button>
                </div>
            </div>
        </div>
    </div>
};

const Deposit = () => {
    return deposit && Number(deposit) ?
        <div className="nav user-balance" data-tip="Your internal balance in Multisender App">
            {" App Balance: " + deposit + "Ⓝ"}
        </div>
        :
        null;
};

const NearLogo = () => {
    return <div className="logo-container content-desktop">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 414 162" className="near-logo">
            <g id="Layer_1" data-name="Layer 1">
                <path className="polymorph"
                      d="M207.21,54.75v52.5a.76.76,0,0,1-.75.75H201a7.49,7.49,0,0,1-6.3-3.43l-24.78-38.3.85,19.13v21.85a.76.76,0,0,1-.75.75h-7.22a.76.76,0,0,1-.75-.75V54.75a.76.76,0,0,1,.75-.75h5.43a7.52,7.52,0,0,1,6.3,3.42l24.78,38.24-.77-19.06V54.75a.75.75,0,0,1,.75-.75h7.22A.76.76,0,0,1,207.21,54.75Z"
                ></path>
                <path className="polymorph"
                      d="M281,108h-7.64a.75.75,0,0,1-.7-1L292.9,54.72A1.14,1.14,0,0,1,294,54h9.57a1.14,1.14,0,0,1,1.05.72L324.8,107a.75.75,0,0,1-.7,1h-7.64a.76.76,0,0,1-.71-.48l-16.31-43a.75.75,0,0,0-1.41,0l-16.31,43A.76.76,0,0,1,281,108Z"
                ></path>
                <path className="polymorph"
                      d="M377.84,106.79,362.66,87.4c8.57-1.62,13.58-7.4,13.58-16.27,0-10.19-6.63-17.13-18.36-17.13H336.71a1.12,1.12,0,0,0-1.12,1.12h0a7.2,7.2,0,0,0,7.2,7.2H357c7.09,0,10.49,3.63,10.49,8.87s-3.32,9-10.49,9H336.71a1.13,1.13,0,0,0-1.12,1.13v26a.75.75,0,0,0,.75.75h7.22a.76.76,0,0,0,.75-.75V87.87h8.33l13.17,17.19a7.51,7.51,0,0,0,6,2.94h5.48A.75.75,0,0,0,377.84,106.79Z"
                ></path>
                <path className="polymorph"
                      d="M258.17,54h-33.5a1,1,0,0,0-1,1h0A7.33,7.33,0,0,0,231,62.33h27.17a.74.74,0,0,0,.75-.75V54.75A.75.75,0,0,0,258.17,54Zm0,45.67h-25a.76.76,0,0,1-.75-.75V85.38a.75.75,0,0,1,.75-.75h23.11a.75.75,0,0,0,.75-.75V77a.75.75,0,0,0-.75-.75H224.79a1.13,1.13,0,0,0-1.12,1.13v29.45a1.12,1.12,0,0,0,1.12,1.13h33.38a.75.75,0,0,0,.75-.75v-6.83A.74.74,0,0,0,258.17,99.67Z"
                ></path>
                <path className="polymorph"
                      d="M108.24,40.57,89.42,68.5a2,2,0,0,0,3,2.63l18.52-16a.74.74,0,0,1,1.24.56v50.29a.75.75,0,0,1-1.32.48l-56-67A9.59,9.59,0,0,0,47.54,36H45.59A9.59,9.59,0,0,0,36,45.59v70.82A9.59,9.59,0,0,0,45.59,126h0a9.59,9.59,0,0,0,8.17-4.57L72.58,93.5a2,2,0,0,0-3-2.63l-18.52,16a.74.74,0,0,1-1.24-.56V56.07a.75.75,0,0,1,1.32-.48l56,67a9.59,9.59,0,0,0,7.33,3.4h2a9.59,9.59,0,0,0,9.59-9.59V45.59A9.59,9.59,0,0,0,116.41,36h0A9.59,9.59,0,0,0,108.24,40.57Z"
                ></path>
            </g>
        </svg>
        <div className="app-name">
            {appSettings.appNme}
        </div>
    </div>;
};

const NavMenu = () => {
    const onClick = () => setIsNaVDropdownActive(!isNavDropdownActive);

    return (
        <div className="nav-menu container">
            <div className="menu-container">
                <button onClick={onClick} className="menu-trigger">
                    <div className="network-icon"></div>
                </button>
                <nav
                    ref={navDropdownRef}
                    className={`menu ${isNavDropdownActive ? "active" : "inactive"}`}
                >
                </nav>
            </div>
        </div>
    );
};

React.useEffect(
    async () => {
        if (window.walletConnection.isSignedIn()) {
            await GetDeposit();
            await ChangeToken(defaultFT);
        }
    },
    // The second argument to useEffect tells React when to re-run the effect
    // Use an empty array to specify "only run on first render"
    // This works because signing into NEAR Wallet reloads the page
    []
);

if (!window.walletConnection.isSignedIn()) {
    return (
        <>
            <Header/>
            <main>
                <h1>{appSettings.appNme}</h1>
                <p>
                    {appSettings.appDescription}
                </p>
                <p>
                    To make use of the NEAR blockchain, you need to sign in. The button
                    below will sign you in using NEAR Wallet.
                </p>
                <p style={{textAlign: 'center', marginTop: '2.5em'}}>
                    <button onClick={login}>Sign in</button>
                </p>
            </main>
        </>
        )
    }

    return (
        <AppContent/>
    );
}

function Notification(props) {
    const urlPrefix = `https://explorer.${config.networkId}.near.org/accounts`
    if (props.method === "call")
        return (
            <aside>
                <a target="_blank" rel="noreferrer" href={`${urlPrefix}/${window.accountId}`}>
                    {window.accountId}
                </a>
                {' '/* React trims whitespace around tags; insert literal space character when needed */}
                called method: '{props.data}' in contract:
                {' '}
                <a target="_blank" rel="noreferrer" href={`${urlPrefix}/${window.contract.contractId}`}>
                    {window.contract.contractId}
                </a>
            </aside>
        );
    else if (props.method === "text")
        return (
            <aside>
                {props.data}
            </aside>
        );
    else return (
            <aside/>
        );
}

function ConvertToYoctoNear(amount) {
    return new BN(Math.round(amount * 100000000)).mul(new BN("10000000000000000")).toString();
}

function ContractCallAlert() {
    alert(
        'Something went wrong! ' +
        'Maybe you need to sign out and back in? ' +
        'Check your browser console for more info.'
    );
}
