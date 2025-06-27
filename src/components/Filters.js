import React from 'react';
import {useTreasury} from '../context/TreasuryContext';

function Filters({filterAccount, setFilterAccount, filterCurrency, setFilterCurrency}) {
    const {accounts} = useTreasury();

    const allCurrencies = ['KES', 'USD', 'NGN']; // Defined currencies

    return (
        <div className="transaction-filters">
            <label htmlFor="filterByAccount">Filter by Account:</label>
            <select
                id="filterByAccount"
                value={filterAccount}
                onChange={(e) => setFilterAccount(e.target.value)}
            >
                <option value="">All Accounts</option>
                {accounts.map(account => (
                    <option key={account.id} value={account.id}>
                        {account.name}
                    </option>
                ))}
            </select>

            <label htmlFor="filterByCurrency">Filter by Currency:</label>
            <select
                id="filterByCurrency"
                value={filterCurrency}
                onChange={(e) => setFilterCurrency(e.target.value)}
            >
                <option value="">All Currencies</option>
                {allCurrencies.map(currency => (
                    <option key={currency} value={currency}>
                        {currency}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default Filters;