import * as yup from 'yup';

import render from './form/views/formView.js';

const app = (initialState = {}) => {
  const state = {
    ...initialState,
    registrationProcess: {
      error: null,
      state: 'filling', // 'processing', 'processed', 'failed'
    },
  };

  const watchedState = render(state);

  const isRssLink = (link) => fetch(link)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network error');
      }
      return response.text();
    })
    .then((text) => text.includes('<rss>') || text.includes('<feed>'))
    .catch((err) => console.log(err));

  const schema = yup.object().shape({
    url: yup.string()
      .url('Ссылка должна быть валидным URL')
      .test('isRss', 'Ресурс не содержит валидный RSS', (link) => isRssLink(link)),
  });

  const validate = (url) => {
    schema
      .validate(url)
      .then((value) => {
        watchedState.registrationProcess.error = '';
        watchedState.registrationProcess.state = 'processing';
        const urls = watchedState.rssLinks.map((link) => link.url);
        if (!urls.includes(value.url)) {
          watchedState.rssLinks.push(value);
        } else {
          throw new Error('RSS уже существует');
        }
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
    validate({ url });
  });
};

export default app;
