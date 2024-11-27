import * as yup from 'yup';
import axios from 'axios';
import { uniqueId } from 'lodash';

import i18next from 'i18next';
import ru from './locales/ru.js';

import render from './form/views/formView.js';

import rssParser from './rssParser.js';

const i18nextInstance = i18next.createInstance();
i18nextInstance.init({
  lng: 'ru',
  debug: true,
  resources: {
    ru,
  },
});

const app = (initialState = {}) => {
  // const defaultId = uniqueId();
  const state = {
    rssLinks: [],
    feeds: [],
    posts: [],
    registrationProcess: {
      infoMessage: '',
      state: 'filling', // 'processing', 'processed', 'failed'
      activeLink: '',
    },
  };

  const watchedState = render(state);

  const getRssContent = () => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(watchedState.registrationProcess.activeLink)}`)
    .then((response) => {
      const parsedData = rssParser(response.data.contents);
      const { feed, posts } = parsedData;

      watchedState.rssLinks.push(watchedState.registrationProcess.activeLink);
      watchedState.feeds.push(feed);
      watchedState.posts.push(...posts);
      watchedState.registrationProcess.state = 'processed';
      console.log(state);
    });

  const isRssLink = (link) => fetch(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(link)}`)
    .then((response) => {
      if (response.ok) return response.text();
      throw new Error(i18nextInstance.t('header.networkErrors.networkError'));
    })
    .then((text) => text.includes('<rss') || text.includes('<feed'))
    .catch((err) => console.log(err));

  yup.setLocale({
    string: {
      url: i18nextInstance.t('header.form.infoMessages.errors.urlIsNotValid'),
    },
  });

  const schema = yup.string()
    .url()
    .test('isRss', i18nextInstance.t('header.form.infoMessages.errors.urlIsNotContainRSS'), (link) => isRssLink(link));
  const validate = (url) => {
    schema
      .validate(url)
      .then((value) => {
        watchedState.registrationProcess.state = 'processing';
        // const urls = state.rssLinks.map((link) => link.url);
        if (state.rssLinks.includes(value)) {
          const urlAlreadyExists = i18nextInstance.t('header.form.infoMessages.errors.urlIsExists');
          throw new Error(urlAlreadyExists);
        }
        watchedState.registrationProcess.infoMessage = i18nextInstance.t('header.form.infoMessages.success');
        watchedState.registrationProcess.activeLink = value;
        getRssContent();
      })
      .catch((err) => {
        watchedState.registrationProcess.infoMessage = err;
        watchedState.registrationProcess.state = 'failed';
        render(state);
      });
  };

  const form = document.querySelector('form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url').trim();
    validate(url);
  });
};

export default app;
