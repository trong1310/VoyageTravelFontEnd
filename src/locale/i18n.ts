import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const languages = ["en", "vi", "cn"];
const resources: any = {};
languages.forEach((language) => {
  resources[language] = {
    translation: {},
  };
});

i18n.use(initReactI18next).init({
  resources: resources,
  lng: "vi",
  fallbackLng: "vi",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
