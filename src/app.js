import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import * as yup from "yup";
import "./style.css";
import view from "./view.js";

export default (i18nInstance) => {
  const elements = {
    form: document.querySelector("form"),
    input: document.querySelector("input"),
    submitBtn: document.querySelector("button"),
  };

  const stateInit = {
    form: {
      url: "",
    },
    error: "",
    currentState: "Filling",

    urls: [],
  };

  const state = view(stateInit, elements);

  let schema = yup.object().shape({
    url: yup
      .string()
      .test(
        // нельзя использовать notOneOf с переменной-массивом. Подробнее: https://github.com/jquense/yup/issues/337
        "проверка на уникальность",
        i18nInstance.t("notUniq"),
        function test(value) {
          return !this.options.context.includes(value);
        }
      )
      .required(i18nInstance.t("empty"))
      .url(i18nInstance.t("notValid")),
    // .notOneOf(, i18nInstance.t('notUniq')),
  });

  const clearError = () => {
    state.error = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    state.form.url = elements.input.value;
    schema
      .validate(state.form, { context: state.urls }) // массив передается как контекст 2-м параметром для yup.string().test
      // см:  https://github.com/jquense/yup#mixedtestname-string-message-string--function-test-function-schema
      .then((valid) => {
        clearError();
        state.urls.push(valid.url);
      })
      .catch((err) => (state.error = err.errors[0]));
    //console.log(elements.input.value === state.urls[0]);
    console.log(state);
  };

  elements.submitBtn.addEventListener("click", handleSubmit);
};
