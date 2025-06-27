import React from 'react';
import {useTreasury} from '../context/TreasuryContext';

function ScheduledTransfers() {
    const {scheduledTransactions, dispatch} = useTreasury();

    const handleExecute = (id) => {
        const confirmExecute = window.confirm("Are you sure you want to execute this scheduled transfer now?");
        if (confirmExecute) {
            dispatch({type: 'EXECUTE_SCHEDULED_TRANSFER', payload: {scheduledTransferId: id}});
        }
    };

    return (
        <div className="scheduled-transfers">
            {scheduledTransactions.length === 0 ? (
                <p className="no-items-message">No scheduled transfers.</p>
            ) : (
                <ul className="scheduled-transfers-list">
                    {scheduledTransactions.map(tx => (
                        <li key={tx.id}>
              <span>
                From: <strong>{tx.fromAccountName}</strong> to <strong>{tx.toAccountName}</strong><br/>
                Amount: {tx.currency} {tx.amount.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
              })}<br/>
                Scheduled: {new Date(tx.scheduledDate).toLocaleString()}
                  {tx.note && <><br/>Note: {tx.note}</>}
              </span>
                            <button onClick={() => handleExecute(tx.id)}>Execute Now</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default ScheduledTransfers;