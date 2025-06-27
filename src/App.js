import React from 'react';
import {TreasuryProvider} from './context/TreasuryContext';
import Header from './components/Header';
import TransferForm from './components/TransferForm';
import AccountsList from './components/AccountsList';
import TransactionHistory from './components/TransactionHistory';
import ScheduledTransfers from './components/ScheduledTransfers';
import Filters from './components/Filters';
import './App.css';

function App() {
    const [filterAccount, setFilterAccount] = React.useState('');
    const [filterCurrency, setFilterCurrency] = React.useState('');

    return (
        <TreasuryProvider>
            <div className="App">
                <Header/>
                <div className="main-content">
                    <div className="section-column accounts-section">
                        <h2>Accounts Overview</h2>
                        <AccountsList/>
                    </div>

                    <div className="section-column transfer-section">
                        <h2>Make a Transfer</h2>
                        <TransferForm/>
                    </div>

                    <div className="section-column transactions-section">
                        <h2>Transaction History</h2>
                        <Filters
                            filterAccount={filterAccount}
                            setFilterAccount={setFilterAccount}
                            filterCurrency={filterCurrency}
                            setFilterCurrency={setFilterCurrency}
                        />
                        <TransactionHistory filterAccount={filterAccount} filterCurrency={filterCurrency}/>
                    </div>

                    <div className="section-column scheduled-section">
                        <h2>Scheduled Transfers</h2>
                        <ScheduledTransfers/>
                    </div>
                </div>
            </div>
        </TreasuryProvider>
    );
}

export default App;