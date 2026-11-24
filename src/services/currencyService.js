
export const convertCurrency = async (amount, from, to) => {
  const response = await fetch(
    `https://api.frankfurter.dev/v2/rate/${from}/${to}`
  );

  if (!response.ok) {
    throw new Error("Unable to get exchange rate.");
  }

  const data = await response.json();

  return {
    result: (Number(amount) * data.rate).toFixed(2),
    rate: data.rate,
    date: data.date
  };
};
