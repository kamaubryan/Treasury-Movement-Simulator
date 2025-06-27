import React, {createContext, useContext, useReducer} from 'react';
import {v4 as uuidv4} from 'uuid';
import {getFxRate} from '../utils/fxRates';

// Initial state for accounts
const initialAccounts = [
    {id: uuidv4(), name: 'Mpesa_KES_1', currency: 'KES', balance: 100000.00},
    {id: uuidv4(), name: 'Bank_KES_2', currency: 'KES', balance: 500000.00},
    {id: uuidv4(), name: 'Wallet_KES_3', currency: 'KES', balance: 25000.00},
    {id: uuidv4(), name: 'Mpesa_USD_1', currency: 'USD', balance: 5000.00},
    {id: uuidv4(), name: 'Bank_USD_2', currency: 'USD', balance: 100000.00},
    {id: uuidv4(), name: 'Wallet_USD_3', currency: 'USD', balance: 1000.00},
    {id: uuidv4(), name: 'Mpesa_NGN_1', currency: 'NGN', balance: 500000.00},
    {id: uuidv4(), name: 'Bank_NGN_2', currency: 'NGN', balance: 1000000.00},
    {id: uuidv4(), name: 'Wallet_NGN_3', currency: 'NGN', balance: 50000.00},
    {id: uuidv4(), name: 'Treasury_USD_4', currency: 'USD', balance: 20000.00}
];

const initialState = {
    accounts: initialAccounts,
    transactions: [],
    scheduledTransactions: []
};

// Reducer function
function treasuryReducer(state, action) {
    switch (action.type) {
        case 'TRANSFER_FUNDS': {
            const {fromAccountId, toAccountId, amount, note, transactionCurrency, isFxConversion} = action.payload;
            const {accounts} = state;

            const fromAccount = accounts.find(acc => acc.id === fromAccountId);
            const toAccount = accounts.find(acc => acc.id === toAccountId);

            if (!fromAccount || !toAccount || fromAccount.balance < amount) {
                return state;
            }

            let convertedAmount = amount;
            let convertedCurrency = transactionCurrency;

            if (fromAccount.currency !== toAccount.currency && isFxConversion) {
                const rate = getFxRate(fromAccount.currency, toAccount.currency);
                if (rate === null) {
                    console.error("FX rate not found for conversion");
                    return state;
                }
                convertedAmount = parseFloat((amount * rate).toFixed(2));
                convertedCurrency = toAccount.currency;
            } else {
                convertedCurrency = fromAccount.currency;
            }


            const updatedAccounts = accounts.map(account => {
                if (account.id === fromAccountId) {
                    return {...account, balance: parseFloat((account.balance - amount).toFixed(2))};
                }
                if (account.id === toAccountId) {
                    return {...account, balance: parseFloat((account.balance + convertedAmount).toFixed(2))};
                }
                return account;
            });

            const newTransaction = {
                id: uuidv4(),
                fromAccountId: fromAccount.id,
                fromAccountName: fromAccount.name,
                toAccountId: toAccount.id,
                toAccountName: toAccount.name,
                originalAmount: amount,
                originalCurrency: fromAccount.currency,
                transferredAmount: convertedAmount,
                transferredCurrency: convertedCurrency,
                timestamp: new Date().toISOString(),
                note: note || ''
            };

            return {
                ...state,
                accounts: updatedAccounts,
                transactions: [newTransaction, ...state.transactions]
            };
        }

        case 'SCHEDULE_TRANSFER': {
            const {fromAccountId, toAccountId, amount, note, scheduledDate} = action.payload;
            const {accounts} = state;

            const fromAccount = accounts.find(acc => acc.id === fromAccountId);
            const toAccount = accounts.find(acc => acc.id === toAccountId);

            if (!fromAccount || !toAccount) {
                return state;
            }

            const newScheduledTransfer = {
                id: uuidv4(),
                fromAccountId: fromAccount.id,
                fromAccountName: fromAccount.name,
                toAccountId: toAccount.id,
                toAccountName: toAccount.name,
                amount: amount,
                currency: fromAccount.currency,
                note: note || '',
                scheduledDate: scheduledDate.toISOString()
            };

            return {
                ...state,
                scheduledTransactions: [...state.scheduledTransactions, newScheduledTransfer]
            };
        }

        case 'EXECUTE_SCHEDULED_TRANSFER': {
            const {scheduledTransferId} = action.payload;
            const scheduledTx = state.scheduledTransactions.find(tx => tx.id === scheduledTransferId);

            if (!scheduledTx) {
                return state;
            }

            const {fromAccountId, toAccountId, amount, note, currency} = scheduledTx;
            const fromAccount = state.accounts.find(acc => acc.id === fromAccountId);

            // Check balance BEFORE executing a scheduled transfer
            if (fromAccount.balance < amount) {
                // This should be handled more gracefully in UI,
                // e.g., show an error and don't remove from scheduled list
                console.warn(`Cannot execute scheduled transfer ${scheduledTransferId}: Insufficient funds.`);
                return state;
            }

            // Re-use the existing TRANSFER_FUNDS logic
            const newStateAfterTransfer = treasuryReducer(state, {
                type: 'TRANSFER_FUNDS',
                payload: {
                    fromAccountId,
                    toAccountId,
                    amount,
                    note,
                    transactionCurrency: currency, // Use original currency for FX logic
                    isFxConversion: true // Always treat as potential FX conversion for scheduled execution
                }
            });

            // Remove from scheduledTransactions
            const updatedScheduledTransactions = newStateAfterTransfer.scheduledTransactions.filter(
                tx => tx.id !== scheduledTransferId
            );

            return {
                ...newStateAfterTransfer,
                scheduledTransactions: updatedScheduledTransactions
            };
        }

        default:
            return state;
    }
}

// Create Context
export const TreasuryContext = createContext(initialState);

// Create Provider Component
export const TreasuryProvider = ({children}) => {
    const [state, dispatch] = useReducer(treasuryReducer, initialState);

    const value = {
        accounts: state.accounts,
        transactions: state.transactions,
        scheduledTransactions: state.scheduledTransactions,
        dispatch
    };

    return (
        <TreasuryContext.Provider value={value}>
            {children}
        </TreasuryContext.Provider>
    );
};

export const useTreasury = () => useContext(TreasuryContext);