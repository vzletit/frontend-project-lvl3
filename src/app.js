import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import * as yup from "yup";
import "./style.css";
import view from "./view.js";
import axios from "axios";

export default (i18nInstance, config) => {
  const elements = {
    form: document.querySelector("form"),
    input: document.querySelector("input"),
    submitBtn: document.querySelector("button"),
    posts: document.querySelector("#posts"),
    feeds: document.querySelector("#feeds"),
  };

  const stateInit = {
    form: {
      url: "",
    },
    error: "",
    currentState: "Filling",
    feedsCount: 0,
    postsCount: 0,
    feeds: [
      // {id: 1; title: '', description: '', url:''}
    ],
    posts: [
      // {feedId: 1, title: '', url: ''}
    ],
  };

  const state = view(stateInit, elements, i18nInstance);

  let schema = yup.object().shape({
    url: yup
      .string()
      .test(
        // нельзя использовать notOneOf и подставлять туда переменную-массив. Подробнее: https://github.com/jquense/yup/issues/337
        "проверка на уникальность",
        i18nInstance.t("errors.notUniq"),
        function test(value) {
          //   return !this.options.context.includes(value);
          let result = true;
          this.options.context.forEach((item) => {
            result = item.url !== value;
          });
          return result;
        }
      )
      .required(i18nInstance.t("errors.empty"))
      .url(i18nInstance.t("errors.notValidUrl")),
  });

  const parseXML = (xmlData) => {
    const parser = new DOMParser();
    return parser.parseFromString(xmlData, "text/xml");
  };
  const saveParsedDataToState = (parsedXMLData, url) => {
    const feedTitle = parsedXMLData.querySelector("title");
    const feedDescr = parsedXMLData.querySelector("description");
    const feedObj = {
      id: state.feedsCount,
      title: feedTitle.textContent,
      description: feedDescr.textContent,
      url: url,
    };
    state.feeds.push(feedObj); // feed info to state
    state.feedsCount += 1;

    const posts = parsedXMLData.querySelectorAll("item");
    posts.forEach((post) => {
      const postTitle = post.querySelector("title");
      const postUrl = post.querySelector("link");
      const postObj = {
        feedId: feedObj.id,
        title: postTitle.textContent,
        url: postUrl.textContent,
        id: state.postsCount,
      };
      state.posts.push(postObj); // current feed posts to state
      state.postsCount += 1;
    });
  };
  const handleSubmit = (e) => {
    e.preventDefault();

    state.form.url = elements.input.value;
    schema
      .validate(state.form, { context: state.feeds }) // массив передается как контекст 2-м параметром для yup.string().test
      // см:  https://github.com/jquense/yup#mixedtestname-string-message-string--function-test-function-schema
      .then((valid) => {
        state.error = "";
        state.currentState = "Retrieving";

        // fire up axios

        axios
          .get(config.proxy + valid.url)
          .then((response) => {
            state.currentState = "Parsing";
            const parsedXMLData = parseXML(response.data.contents); // parsing

            if (parsedXMLData.querySelector("parsererror") != null) {
              state.error = i18nInstance.t("errors.notValidXml");
             return;
            } else {
              saveParsedDataToState(parsedXMLData, valid.url);
            }
            state.currentState = "Added";
            state.currentState = "Rendering";
          })
          .catch((error) => {
            if (error.response) {
              state.error = i18nInstance.t("errors.serverResponceError");
              // The request was made and the server responded with a status code
              // that falls out of the range of 2xx
            } else if (error.request) {
              state.error = i18nInstance.t("errors.erverNotResonding"); // The request was made but no response was received
            } else {
              // Something happened in setting up the request that triggered an Error
              state.error = i18nInstance.t("errors.networkError");
            }
          });
      })
      .catch((err) => (state.error = err.errors[0])); // url validation errors
  };

  elements.submitBtn.addEventListener("click", handleSubmit);
};
