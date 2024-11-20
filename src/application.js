import * as yup from 'yup';

import i18next from 'i18next';
import ru from './locales/ru.js';

import render from './form/views/formView.js';

const i18nextInstance = i18next.createInstance();
i18nextInstance.init({
  lng: 'ru',
  debug: true,
  resources: {
    ru,
  },
});

//
// const formErrorsText = i18nextInstance.t('header.form.errors');

const app = (initialState = {}) => {
  const state = {
    ...initialState,
    registrationProcess: {
      error: '',
      state: 'filling', // 'processing', 'processed', 'failed'
    },
  };

  const watchedState = render(state);

  const isRssLink = (link) => fetch(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(link)}`)
    .then((response) => {
      if (response.ok) return response.text();
      throw new Error(i18nextInstance.t('header.networkErrors.networkError'));
    })
    .then((text) => text.includes('<rss') || text.includes('<feed'))
    .catch((err) => console.log(err));

  yup.setLocale({
    string: {
      url: i18nextInstance.t('header.form.errors.urlIsNotValid'),
    },
  });

  const schema = yup.string()
    .url()
    .test('isRss', i18nextInstance.t('header.form.errors.urlIsNotContainRSS'), (link) => isRssLink(link));
  const validate = (url) => {
    schema
      .validate(url)
      .then((value) => {
        watchedState.registrationProcess.error = '';
        watchedState.registrationProcess.state = 'processing';
        const urls = state.rssLinks.map((link) => link.url);
        if (urls.includes(value.url)) {
          const urlAlreadyExists = i18nextInstance.t('header.form.errors.urlIsExists');
          throw new Error(urlAlreadyExists);
        }
        state.rssLinks.push(value);
        watchedState.registrationProcess.state = 'processed';
        render(state);
      })
      .catch((err) => {
        watchedState.registrationProcess.error = err;
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
