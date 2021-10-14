import app from "./app.js";
import i18n from "i18next";
import resources from "./locales/index.js";


const i18nInstance = i18n.createInstance();
i18nInstance
  .init({
    lng: "ru",
    debug: false,
    resources,
  })
  .then(
    app(i18nInstance, {
      proxy:
        "https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=",
      updateIntervalSec: 5,
    })
  );
