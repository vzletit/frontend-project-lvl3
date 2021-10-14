import app from "./src/app.js";
import i18n from "i18next";
import resources from "./src/locales";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.js";


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
