import i18next from 'i18next';

export default i18next.init({
  lng: 'en',
  debug: true,
  resources: {
    en: {
      translation: {
        investedSharesValue: 'Investierte Anlagen',
        earnedSharesValue: 'Bekommene Anlagen',
        bonusSharesValue: 'Bonus Anlagen',
        reinvestedSharesValue: 'Reinvestierte Anlagen',
        totalSharesValue: 'Gesamte Anlagen',
      },
    },
  },
});
