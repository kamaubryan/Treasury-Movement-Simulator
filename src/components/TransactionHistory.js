import React from 'react';
import {useTreasury} from '../context/TreasuryContext';

function TransactionHistory({filterAccount, filterCurrency}) {
    const {transactions, accounts} = useTreasury();

    // Helper to get account name by ID (for robust filtering)
    const getAccountNameById = (accountId) => {
        const account = accounts.find(acc => acc.id === accountId);
        return account ? account.name : 'Unknown Account';
    };

    const filteredTransactions = transactions.filter(tx => {
        const matchesAccount = filterAccount
            ? (tx.fromAccountId === filterAccount || tx.toAccountId === filterAccount)
            : true;

        const matchesCurrency = filterCurrency
            ? (tx.originalCurrency === filterCurrency || tx.transferredCurrency === filterCurrency)
            : true;

        return matchesAccount && matchesCurrency;
    });

    return (
        <div className="transaction-history">
            {filteredTransactions.length === 0 ? (
                <p className="no-items-message">No transactions to display.</p>
            ) : (
                <table className="transaction-table">
                    <thead>
                    <tr>
                        <th>Date/Time</th>
                        <th>From Account</th>
                        <th>To Account</th>
                        <th>Original Amount</th>
                        <th>Transferred Amount</th>
                        <th>Note</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredTransactions.map(tx => (
                        <tr key={tx.id}>
                            <td>{new Date(tx.timestamp).toLocaleString()}</td>
                            <td>{tx.fromAccountName}</td>
                            <td>{tx.toAccountName}</td>
                            <td>{tx.originalCurrency} {tx.originalAmount.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}</td>
                            <td>
                                {tx.originalCurrency !== tx.transferredCurrency ? (
                                    <>
                                        {tx.transferredCurrency} {tx.transferredAmount.toLocaleString('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}
                                        <br/>
                                        <small>(FX from {tx.originalCurrency})</small>
                                    </>
                                ) : (
                                    `${tx.transferredCurrency} ${tx.transferredAmount.toLocaleString('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}`
                                )}
                            </td>
                            <td>{tx.note || '-'}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default TransactionHistory;