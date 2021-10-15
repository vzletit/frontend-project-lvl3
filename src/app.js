import i18n from 'i18next';
import { uniqueId } from 'lodash';
import watcher from './view.js';
import resources from './locales';
import validate from './validator.js';
import parse from './parser.js';
import load from './XMLloader.js';
import updatePosts from './updatePosts.js';
import 'bootstrap/dist/css/bootstrap.css';

export default () => {
  // Init app
  const i18nInstance = i18n.createInstance();
  i18nInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  });

  const elements = {
    form: document.querySelector('form'),
    addBtn: document.querySelector('button[type=submit]'),
    input: document.querySelector('input'),
    posts: document.querySelector('#posts'),
    feeds: document.querySelector('#feeds'),
    modalTitle: document.querySelector('#modalTitle'),
    modalDescription: document.querySelector('#modalDescription'),
    modalCloseBtn: document.querySelector('button#modalCloseBtn'),
  };
  const stateInit = {
    modal: {
      postId: '',
      title: '',
      description: '',
    },
    form: {
      url: '',
    },
    error: '',
    currentState: 'Filling',
    feeds: [],
    posts: [],
  };

  const state = watcher(stateInit, elements, i18nInstance);

  const handleSubmit = (e) => {
    e.preventDefault();
    state.form.url = elements.input.value;
    state.error = '';
    state.currentstate = 'Validating';
    validate(state.form, state.feeds)
      .then((valid) => {
        state.currentState = 'Loading';
        return load(valid.url);
      })
      .then((response) => {
        const newFeedId = uniqueId('feed');
        return parse(response, state.form.url, newFeedId);
      })
      .then((newFeed) => {
        state.feeds.push(newFeed.feed);
        state.posts = [...state.posts, ...newFeed.posts];
        state.posts.forEach((item) => { item.id = uniqueId('post'); });

        state.currentState = 'Added';
        state.currentState = 'Rendering';
      })
      .catch((err) => {
        state.error = err.message;
        state.currentState = 'Error';
      });
  };
  updatePosts(state);

  const handleModal = (e) => {
    e.preventDefault();

    state.currentState = 'Filling';

    if (e.target.id === 'modalShowBtn') {
      state.modal.postId = e.target.dataset.id;

      const currentPostIndex = state.posts.findIndex((post) => post.id === state.modal.postId);
      state.modal.title = state.posts[currentPostIndex].title;
      state.modal.description = state.posts[currentPostIndex].description;
      state.posts[currentPostIndex].visited = true;

      state.currentState = 'Modal';
    }
  };

  elements.form.addEventListener('submit', handleSubmit);
  elements.posts.addEventListener('click', handleModal);
};
