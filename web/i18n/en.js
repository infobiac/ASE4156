import i18next from 'i18next';

export default i18next.init({
  lng: 'en',
  debug: true,
  resources: {
    en: {
      translation: {
        investedSharesValue: 'Invested Shares',
        earnedSharesValue: 'Earned Shares',
        bonusSharesValue: 'Bonus Shares',
        reinvestedSharesValue: 'Reinvested Shares',
        totalSharesValue: 'Total Shares',
      },
    },
  },
});
