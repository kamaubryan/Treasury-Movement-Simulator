import React from 'react';

function AccountCard({account}) {
    return (
        <div className="account-card">
            <strong>{account.name}</strong>
            <span>{account.currency} {account.balance.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}</span>
        </div>
    );
}

export default AccountCard;