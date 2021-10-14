import * as yup from "yup";
import "./style.css";
import view from "./view.js";
import axios from "axios";
import { uniqueId, differenceBy } from "lodash";

export default (i18nInstance, config) => {
  const elements = {
    form: document.querySelector("form"),
    input: document.querySelector("input"),
    submitBtn: document.querySelector("button[type='submit']"),
    posts: document.querySelector("#posts"),
    feeds: document.querySelector("#feeds"),
    modal: document.querySelector("#modal"),
    modalTitle: document.querySelector("#modalTitle"),
    modalDescription: document.querySelector("#modalDescription"),
    modalCloseBtn: document.querySelector("button#modalCloseBtn"),
  };

  const stateInit = {
    config: config,
    modal: {
      postId: "",
      title: "",
      description: "",
    },

    form: {
      url: "",
    },
    error: "",
    currentState: "Filling",
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
        // We cannot use notOneOf with variable (dynamical) array. See: https://github.com/jquense/yup/issues/337
        // So, we use .test with NO-ARROW function inside.
        "Check for uniqueness",
        i18nInstance.t("errors.notUniq"),
        function test(value) {
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
  const getFeedInfo = (parsedXMLData, feedUrl) => {
    const feedTitle = parsedXMLData.querySelector("title");
    const feedDescr = parsedXMLData.querySelector("description");
    return {
      title: feedTitle.textContent,
      description: feedDescr.textContent,
      url: feedUrl,
    };
  };
  const getPostsFromParsedFeed = (parsedXMLData, feedId) => {
    const resultArr = [];
    const posts = parsedXMLData.querySelectorAll("item");
    posts.forEach((post) => {
      const postTitle = post.querySelector("title");
      const postUrl = post.querySelector("link");
      const postDescription = post.querySelector("description");
      const postObj = {
        description: postDescription.textContent,
        feedId: feedId,
        title: postTitle.textContent,
        url: postUrl.textContent,
        visited: false,
      };
      resultArr.push(postObj);
    });
    return resultArr;
  };
  const setIDs = (arrayOfObj = [], prefix) => {
    arrayOfObj.forEach((item) => (item.id = uniqueId(prefix)));
    return arrayOfObj;
  };
  const updateFeeds = (feedsToUpdate, updateIntervalInSec) => {
    const updateInterval = updateIntervalInSec * 1000;
    const updateProcess = () => {
      state.currentState = "Updating";
      state.feeds.forEach((feed) => {
        axios
          .get(state.config.proxy + feed.url)
          .then((response) => {
            const parsedUpdatedFeed = parseXML(response.data.contents);
            const updatedPostsList = getPostsFromParsedFeed(
              parsedUpdatedFeed,
              feed.id
            ); //[{},{}]
            const oldPostsList = state.posts.filter(
              (post) => post.feedId === feed.id
            ); // [{},{}]

            const newPostsInFeed = differenceBy(
              updatedPostsList,
              oldPostsList,
              "url"
            );
            setIDs(newPostsInFeed);
            state.posts = [...state.posts, ...newPostsInFeed];
            state.currentState = "Rendering";
          })
          .catch(
            () =>
              (state.error = i18nInstance.t("updateError", {
                feedUrl: feed.url,
              }))
          );
      });
      updateFeeds(feedsToUpdate, updateIntervalInSec);
    };

    setTimeout(updateProcess, updateInterval);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    state.form.url = elements.input.value;
    schema
      .validate(state.form, { context: state.feeds }) // variable (dynamical) array can be passed as context via 2nd argument for yup.string().test
      // see:  https://github.com/jquense/yup#mixedtestname-string-message-string--function-test-function-schema
      .then((valid) => {
        state.error = "";

        axios
          .get(state.config.proxy + valid.url)
          .then((response) => {
            const parsedXMLData = parseXML(response.data.contents);

            // handle parsing error:
            if (parsedXMLData.querySelector("parsererror") != null) {
              state.error = i18nInstance.t("errors.notValidXml");
              return;
            } else {
              // on successful parsing:
              const newFeed = getFeedInfo(parsedXMLData, valid.url);
              newFeed.id = uniqueId("feed");
              state.feeds.push(newFeed);
              const newPosts = getPostsFromParsedFeed(
                parsedXMLData,
                newFeed.id
              );
              state.posts = [...state.posts, ...newPosts];
              setIDs(state.posts, "post");
            }
            state.currentState = "Added";
            state.currentState = "Rendering";

            updateFeeds(state.feeds, state.config.updateIntervalSec);
          }) // top-level Then

          .catch((error) => {
            if (error.response) {
              state.error = i18nInstance.t("errors.serverResponceError");
              // The request was made and the server responded with a status code
              // that falls out of the range of 2xx
            } else if (error.request) {
              state.error = i18nInstance.t("errors.serverNotResponding"); // The request was made but no response was received
            } else {
              // Something happened in setting up the request that triggered an Error
              state.error = i18nInstance.t("errors.networkError");
            }
          });
      })
      .catch((err) => (state.error = err.errors[0])); // url validation errors
  };
  const handleModal = (e) => {
    e.preventDefault;

    state.currentState = "Filling";

    if (e.target.id === "modalShowBtn") {
      state.modal.postId = e.target.dataset.id; // needed to change link font-weight NOW.

      const currentPostIndex = state.posts.findIndex(
        (post) => post.id === state.modal.postId
      );
      state.modal.title = state.posts[currentPostIndex].title;
      state.modal.description = state.posts[currentPostIndex].description;
      state.posts[currentPostIndex].visited = true;

      state.currentState = "Modal";
    }
  };

  elements.submitBtn.addEventListener("click", handleSubmit);
  elements.posts.addEventListener("click", handleModal);
};
