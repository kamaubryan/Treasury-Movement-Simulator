// A simple static FX rate definition.
// For a real application, these would come from an external API or database.
// Rates are defined as 1 unit of fromCurrency = X units of toCurrency.
const FX_RATES = {
    'KES_USD': 0.0075,
    'USD_KES': 133.33,
    'KES_NGN': 10.0,
    'NGN_KES': 0.1,
    'USD_NGN': 1333.33,
    'NGN_USD': 0.00075,
};

export const getFxRate = (fromCurrency, toCurrency) => {
    if (fromCurrency === toCurrency) {
        return 1;
    }

    const rateKey = `${fromCurrency}_${toCurrency}`;
    const rate = FX_RATES[rateKey];

    if (rate === undefined) {
        console.warn(`FX rate not found for ${rateKey}`);
        return null;
    }

    return rate;
};