import React, {useState} from 'react';
import {useTreasury} from '../context/TreasuryContext';
import {getFxRate} from '../utils/fxRates';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function TransferForm() {
    const {accounts, dispatch} = useTreasury();
    const [fromAccount, setFromAccount] = useState('');
    const [toAccount, setToAccount] = useState('');
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [scheduledDate, setScheduledDate] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const selectedFromAccount = accounts.find(acc => acc.id === fromAccount);
    const selectedToAccount = accounts.find(acc => acc.id === toAccount);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const parsedAmount = parseFloat(amount);

        if (!fromAccount || !toAccount || !parsedAmount) {
            setError('Please fill in all required fields (From Account, To Account, Amount).');
            return;
        }

        if (fromAccount === toAccount) {
            setError('Cannot transfer to the same account.');
            return;
        }

        if (parsedAmount <= 0) {
            setError('Amount must be positive.');
            return;
        }

        if (!selectedFromAccount) {
            setError('Selected "From Account" not found.');
            return;
        }
        if (!selectedToAccount) {
            setError('Selected "To Account" not found.');
            return;
        }

        if (selectedFromAccount.balance < parsedAmount) {
            setError('Insufficient funds in the source account.');
            return;
        }

        // If a future date is selected, schedule the transfer
        if (scheduledDate) {
            dispatch({
                type: 'SCHEDULE_TRANSFER',
                payload: {
                    fromAccountId: fromAccount,
                    toAccountId: toAccount,
                    amount: parsedAmount,
                    note,
                    scheduledDate
                }
            });
            setSuccess('Transfer scheduled successfully!');
        } else {
            // Direct transfer
            dispatch({
                type: 'TRANSFER_FUNDS',
                payload: {
                    fromAccountId: fromAccount,
                    toAccountId: toAccount,
                    amount: parsedAmount,
                    note,
                    transactionCurrency: selectedFromAccount.currency, // Pass original currency for FX logic in reducer
                    isFxConversion: selectedFromAccount.currency !== selectedToAccount.currency
                }
            });
            setSuccess('Transfer successful!');
        }


        // Clear form
        setFromAccount('');
        setToAccount('');
        setAmount('');
        setNote('');
        setScheduledDate(null);
    };

    // Calculate estimated received amount for FX conversion display
    const estimatedReceived = React.useMemo(() => {
        if (selectedFromAccount && selectedToAccount && amount && selectedFromAccount.currency !== selectedToAccount.currency) {
            const parsedAmount = parseFloat(amount);
            if (!isNaN(parsedAmount) && parsedAmount > 0) {
                const rate = getFxRate(selectedFromAccount.currency, selectedToAccount.currency);
                if (rate !== null) {
                    return (parsedAmount * rate).toFixed(2);
                }
            }
        }
        return null;
    }, [fromAccount, toAccount, amount, accounts]);


    return (
        <form onSubmit={handleSubmit} className="transfer-form">
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}

            <label htmlFor="fromAccount">From Account:</label>
            <select
                id="fromAccount"
                value={fromAccount}
                onChange={(e) => setFromAccount(e.target.value)}
                required
            >
                <option value="">Select source account</option>
                {accounts.map(account => (
                    <option key={account.id} value={account.id}>
                        {account.name} ({account.currency} {account.balance.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })})
                    </option>
                ))}
            </select>

            <label htmlFor="toAccount">To Account:</label>
            <select
                id="toAccount"
                value={toAccount}
                onChange={(e) => setToAccount(e.target.value)}
                required
            >
                <option value="">Select destination account</option>
                {accounts.map(account => (
                    <option key={account.id} value={account.id}>
                        {account.name} ({account.currency} {account.balance.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })})
                    </option>
                ))}
            </select>

            <label htmlFor="amount">Amount:</label>
            <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0.01"
                step="0.01"
                required
            />

            {estimatedReceived && (
                <p>Estimated received by destination: {selectedToAccount.currency} {estimatedReceived}</p>
            )}

            <label htmlFor="note">Note (Optional):</label>
            <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows="2"
            ></textarea>

            <label htmlFor="scheduledDate">Schedule Transfer (Optional):</label>
            <DatePicker
                id="scheduledDate"
                selected={scheduledDate}
                onChange={(date) => setScheduledDate(date)}
                minDate={new Date()} // Cannot schedule in the past
                dateFormat="Pp"
                showTimeSelect
                placeholderText="Select a future date and time"
                className="date-picker-input" // Apply some basic styling if needed
            />
            <br/><br/> {/* Add a line break for spacing */}


            <button type="submit">
                {scheduledDate ? 'Schedule Transfer' : 'Perform Transfer'}
            </button>
        </form>
    );
}

export default TransferForm;