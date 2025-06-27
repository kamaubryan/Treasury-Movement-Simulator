import React from 'react';
import { useTreasury } from '../context/TreasuryContext';
import AccountCard from './AccountCard';

function AccountsList() {
  const { accounts } = useTreasury();

  return (
    <div className="accounts-list">
      {accounts.length === 0 ? (
        <p className="no-items-message">No accounts available.</p>
      ) : (
        accounts.map(account => (
          <AccountCard key={account.id} account={account} />
        ))
      )}
    </div>
  );
}

export default AccountsList;