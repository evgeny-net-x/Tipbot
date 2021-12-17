use crate::*;

#[near_bindgen]
impl NearTips {
    pub fn send_tip_with_auth(&mut self,
                                          contact: Contact,
                                          amount: WrappedBalance,
                                          chat_id: Option<ChatId>,
                                          token_id: Option<TokenAccountId>) -> Promise {
        self.assert_tip_available();
        assert!(amount.0 > 0, "Positive amount needed");
        self.assert_check_whitelisted_token(&token_id);

        let account_id = env::predecessor_account_id();
        let deposit = self.get_deposit_for_account_id(&account_id, &token_id);

        assert!(amount.0 <= deposit, "Not enough tokens to tip (Deposit: {}. Requested: {})", deposit, amount.0);

        self.get_contact_owner(contact.clone(), self.auth_account_id.to_string()).
            then(ext_self::on_get_contact_owner_on_send_tip_with_auth(
                account_id,
                amount.0,
                contact.clone(),
                chat_id,
                token_id,
                &env::current_account_id(),
                NO_DEPOSIT,
                CALLBACK_GAS * 2,
            ))
    }

    pub fn on_get_contact_owner_on_send_tip_with_auth(&mut self,
                                                                  #[callback] account: Option<AccountId>,
                                                                  sender_account_id: AccountId,
                                                                  tip_amount: Balance,
                                                                  contact: Contact,
                                                                  chat_id: Option<ChatId>,
                                                                  token_id: Option<TokenAccountId>) {
        assert_eq!(
            env::predecessor_account_id(),
            env::current_account_id(),
            "Callback can only be called from the contract"
        );

        let token_id_unwrapped = NearTips::unwrap_token_id(&token_id);

        match account {
            Some(account_id) => {
                self.decrease_deposit(sender_account_id.clone(), token_id_unwrapped.clone(), tip_amount);
                self.deposit_amount_to_account(&account_id, tip_amount, token_id);
                env::log(format!("@{} tipped {} of {:?} to NEAR account {} contact {}:{}", sender_account_id, tip_amount, token_id_unwrapped, account_id, contact.category, contact.user_id).as_bytes());
            }
            None => {
                env::log(format!("Authorized contact wasn't found. Continue to send from @{}", sender_account_id).as_bytes());
                self.send_tip_to_contact_from_account(sender_account_id, contact.clone(), U128::from(tip_amount), chat_id, token_id);
            }
        }
    }

    #[payable]
    // decentralized tips withdraw for those who made near auth.
    pub fn withdraw_from_with_auth(&mut self,
                                            contact: Contact,
                                            token_id: Option<TokenAccountId>) -> Promise {
        self.assert_withdraw_available();

        let account_id = env::predecessor_account_id();

        self.get_contact_owner(contact.clone(), self.auth_account_id.to_string()).
            then(ext_self::on_get_contact_owner_on_withdraw_with_auth(
                account_id,
                contact.clone(),
                token_id,
                &env::current_account_id(),
                NO_DEPOSIT,
                CALLBACK_GAS * 3,
            ))
    }

    pub fn on_get_contact_owner_on_withdraw_with_auth(&mut self,
                                                                    #[callback] account: Option<AccountId>,
                                                                    recipient_account_id: AccountId,
                                                                    contact: Contact,
                                                                    token_id: Option<TokenAccountId>) -> Promise {
        assert_eq!(
            env::predecessor_account_id(),
            env::current_account_id(),
            "Callback can only be called from the contract"
        );

        match account {
            Some(account) => {
                assert!(account == recipient_account_id, "Not authorized to withdraw");

                let balance: Balance = self.get_balance(contact.clone(), token_id.clone()).0;
                assert!(balance > 0, "Not enough tokens to withdraw");

                let predecessor_account_id = env::predecessor_account_id();
                let token_id_unwrapped = NearTips::unwrap_token_id(&token_id);

                self.set_balance_to_zero(contact.clone(), token_id_unwrapped.clone());

                env::log(format!("@{} withdrew {} of {:?} from user account {}",
                                 predecessor_account_id, balance, token_id_unwrapped, contact.user_id).as_bytes());

                if token_id_unwrapped == NEAR {
                    Promise::new(recipient_account_id).transfer(balance)
                } else {
                    ext_fungible_token::ft_transfer(
                        recipient_account_id,
                        balance.into(),
                        Some(format!("Claiming tips: {} of {:?} from @{}", balance, token_id_unwrapped, env::current_account_id())),
                        &token_id_unwrapped,
                        ONE_YOCTO,
                        GAS_FOR_FT_TRANSFER,
                    )
                        .then(ext_self::after_ft_transfer_balance(
                            contact.clone(),
                            balance.into(),
                            token_id_unwrapped,
                            &env::current_account_id(),
                            NO_DEPOSIT,
                            GAS_FOR_AFTER_FT_TRANSFER,
                        ))
                }
            }
            None => {
                panic!("Contact wasn't authorized to any account");
            }
        }
    }

    #[payable]
    // tip from balance to near account deposit without knowing NEAR account_id.
    pub fn tip_contact_to_deposit(&mut self, contact: Contact, amount: WrappedBalance, token_id: Option<TokenAccountId>) -> Promise {
        self.assert_tip_available();
        assert!(amount.0 > 0, "Positive amount needed");
        self.assert_check_whitelisted_token(&token_id);

        let account_id = env::predecessor_account_id();
        let account_id_prepared: ValidAccountId = ValidAccountId::try_from(account_id.clone()).unwrap();
        let deposit: Balance = NearTips::get_deposit(self, account_id_prepared, token_id.clone()).0;

        assert!(
            amount.0 <= deposit,
            "Not enough tokens deposited to tip (Deposit: {}. Requested: {})",
            deposit, amount.0
        );

        self.get_contact_owner(contact.clone(), self.auth_account_id.to_string()).
            then(ext_self::on_get_contact_owner_on_tip_contact_to_deposit(
                account_id,
                contact.clone(),
                amount.0,
                token_id,
                &env::current_account_id(),
                NO_DEPOSIT,
                CALLBACK_GAS,
            ))
    }

    pub fn on_get_contact_owner_on_tip_contact_to_deposit(&mut self,
                                                          #[callback] account: Option<AccountId>,
                                                          sender_account_id: AccountId,
                                                          contact: Contact,
                                                          amount: Balance,
                                                          token_id: Option<TokenAccountId>) {
        assert_eq!(
            env::predecessor_account_id(),
            env::current_account_id(),
            "Callback can only be called from the contract"
        );

        assert!(!account.is_none(), "Owner not found");
        let receiver_account_id: AccountId = account.unwrap();

        let token_id_unwrapped = NearTips::unwrap_token_id(&token_id);

        self.decrease_deposit(sender_account_id.clone(), token_id_unwrapped.clone(), amount);

        self.increase_deposit(receiver_account_id.clone(), token_id_unwrapped.clone(), amount);

        env::log(format!("@{} transferred {} of {:?} to deposit of @{} [{:?} account {:?}]",
                         sender_account_id, amount, token_id_unwrapped, receiver_account_id, contact.category, contact.user_id).as_bytes());
    }
}
