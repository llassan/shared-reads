// Single place to change display currency for the whole app.
export const CURRENCY_SYMBOL = '$'

export const formatMoney = (amount: number | string): string =>
  `${CURRENCY_SYMBOL}${Number(amount).toLocaleString()}`
