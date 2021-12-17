use crate::*;

#[near_bindgen]
impl NearTips {
    #[init(ignore_state)]
    #[allow(dead_code)]
    pub fn migrate_state_4() -> Self { // RewardPoint type updated , total_chat_points added
        let migration_version: u16 = 4;
        assert_eq!(env::predecessor_account_id(), env::current_account_id(), "Private function");

        #[derive(BorshDeserialize)]
        struct OldContract {
            deposits: LookupMap<TokenByNearAccount, Balance>,
            tips: LookupMap<TokenByContact, Balance>,
            contacts_in_chats: LookupSet<ContactInChat>,
            chat_points: LookupMap<TokenByChat, RewardPoint>,
            whitelisted_tokens: LookupSet<TokenAccountId>,
            whitelisted_categories: LookupSet<ContactCategory>,
            version: u16,
            withdraw_available: bool,
            tip_available: bool,
            generic_tips_available: bool,
        }

        let old_contract: OldContract = env::state_read().expect("Old state doesn't exist");

        Self {
            deposits: old_contract.deposits,
            tips: old_contract.tips,
            contacts_in_chats: old_contract.contacts_in_chats,
            whitelisted_tokens: old_contract.whitelisted_tokens,
            whitelisted_categories: old_contract.whitelisted_categories,
            version: migration_version,
            withdraw_available: old_contract.withdraw_available,
            tip_available: old_contract.tip_available,
            generic_tips_available: false,

            chat_settings: LookupMap::new(StorageKey::ChatSettingsLookupMap),
            treasure: LookupMap::new(StorageKey::TreasureLookupMap),

            chat_points: LookupMap::new(StorageKey::ChatPointsLookupMapU128), // fix

            user_tokens_to_claim: LookupMap::new(StorageKey::UserTokensToClaimLookupMap),
            master_account_id: "zavodil.testnet".to_string(),
            linkdrop_account_id: "linkdrop.zavodil.testnet".to_string(),
            auth_account_id: "dev-1625611642901-32969379055293".to_string(),
            tiptoken_account_id: "tiptoken.zavodil.testnet".to_string(),
            total_tiptokens: 0,
            tiptokens_burned: 0
        }
    }
}
