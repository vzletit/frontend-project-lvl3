import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import * as yup from "yup";
//import _ from "lodash";
import "./style.css";
import view from "./view.js";
//import app from './app.js';

const main = () => {
  const elements = {
    form: document.querySelector("form"),
    input: document.querySelector("input"),
    submitBtn: document.querySelector("button"),
  };

  const stateInit = {
    form: {
      url: "",
    },
    errors: {
      notValid: "URL не корректный.",
      notUniq: "Такой URL уже есть.",
    },
    isUrlValid: "",
    isUrlUnique: "",
    currentState: "Filling",

    urls: [],
  };

  const state = view(stateInit, elements);

  let schema = yup.object().shape({
    url: yup.string().min(1, state.errors.notValid).url(state.errors.notValid),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    state.currentState = "Validating";
    state.form.url = elements.input.value;
    schema
      .isValid(state.form)
      .then((valid) => (state.isUrlValid = valid)) // t/f Valid
      .then(() => {
        state.isUrlUnique = state.urls.indexOf(state.form.url) === -1;
        if (state.isUrlUnique && state.isUrlValid) {
          state.urls.push(state.form.url);
          state.currentState = "Filling";
        }
      }); // t/f Uniq

    console.log(state);
  };

  elements.submitBtn.addEventListener("click", handleSubmit);
};

main();
