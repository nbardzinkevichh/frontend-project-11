import onChange from "on-change";

import { Modal } from 'bootstrap';

const buildCardStructure = (title) => {
  const card = document.createElement('div');
  card.classList.add('card', 'border-0');
  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');
  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.innerHTML = title;
  cardBody.append(cardTitle);
  card.append(cardBody);

  const listGroup = document.createElement('ul');
  listGroup.classList.add('list-group', 'border-0', 'rounded-0');
  card.append(listGroup);
  return card;
};

const renderPosts = (state, container) => {
  container.innerHTML = '';
  const card = buildCardStructure('Посты');

  const modal = document.querySelector('.modal');
  const modalWindow = new Modal(modal);
  const modalTitleText = document.getElementById('modalLabel');
  const modalBodyPText = document.getElementById('modalBodyP');

  const showModal = (title, description) => {
    modalTitleText.textContent = title;
    modalBodyPText.textContent = description;
    modalWindow.show();
  };

  container.append(card);
  // сделать функционал с постоянным добавлением обновлений
  // реализация изменения вида ссылок, когда их посетили

  const group = document.querySelector('.list-group');
  state.posts.forEach((item) => {
    const element = document.createElement('li');
    const elementLink = document.createElement('a');
    const title = item.title.length > 62 ? `${item.title.slice(0, 62)}...` : item.title;
    elementLink.textContent = title;
    elementLink.setAttribute('href', item.link);
    elementLink.setAttribute('target', '_blank');
    elementLink.setAttribute('rel', 'noopener noreferrer');
    elementLink.classList.add('fw-bold');
    element.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    element.append(elementLink);
    const viewButton = document.createElement('button');
    viewButton.setAttribute('type', 'button');
    viewButton.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    viewButton.textContent = 'Просмотр';
    viewButton.dataset.bsToggle = 'modal';
    viewButton.dataset.bsTarget = '#modal';
    viewButton.dataset.id = item.id;
    viewButton.dataset.link = item.link;
    element.append(viewButton);
    group.append(element);
  });
  const viewModalButtons = document.querySelectorAll('.btn-outline-primary');
  // let url;
  viewModalButtons.forEach((button) => {
    button.addEventListener(('click'), (e) => {
      const post = state.posts.find((element) => element.id === e.target.dataset.id);
      console.log(post.id);
      const url = e.target.dataset.link;
      showModal(post.title, post.description);
      // const postTitle = document.querySelector(`[href='${e.target.dataset.link}']`);
      // console.log(postTitle);
      // postTitle.styles.color = '#d3d3d3';
      const readInFullButton = document.querySelector('#readFullButton');
      readInFullButton.setAttribute('href', url);
      readInFullButton.setAttribute('target', '_blank');
      readInFullButton.setAttribute('rel', 'noopener noreferrer');
    });
  });

  container.append(card);
};

const renderFeeds = (state, container) => {
  container.innerHTML = '';
  const card = buildCardStructure('Фиды');
  container.append(card);
  const groups = document.querySelectorAll('.list-group');
  state.feeds.forEach((item) => {
    const element = document.createElement('li');
    const header = document.createElement('h3');
    const p = document.createElement('p');
    p.textContent = item.feedDescription;
    p.classList.add('m-0', 'small', 'text-black-50');
    header.textContent = item.feedTitle;
    header.classList.add('h6', 'm-0');
    element.classList.add('list-group-item', 'border-0', 'border-end-0');
    element.append(header);
    element.append(p);
    groups[1].append(element);
  });
  container.append(card);
};

export default (state) => {
  const render = (path, value, previousValue) => {
    const postsContainer = document.querySelector('.posts');
    const feedsContainer = document.querySelector('.feeds');

    const input = document.querySelector('#url-input');
    const form = document.querySelector('form');
    const infoMessage = document.createElement('p');
    infoMessage.classList.add('feedback', 'm-0', 'position-absolute', 'small');
    const errorMessage = document.querySelector('.feedback');
    const loader = document.querySelector('.loader');
    if (path === 'registrationProcess.state') {
      loader.classList.add('hidden');
      if (value === 'failed') {
        infoMessage.classList.add('text-danger');
        infoMessage.innerHTML = state.registrationProcess.infoMessage.message;
        form.insertAdjacentElement('afterend', infoMessage);
        input.classList.add('is-invalid');
      }
      if (value === 'processing') {
        loader.classList.remove('hidden');
        form.reset();
        input.focus();
        if (errorMessage) {
          errorMessage.remove();
          input.classList.remove('is-invalid');
        }
      }
      if (value === 'processed') {
        if (errorMessage) {
          errorMessage.remove();
          input.classList.remove('is-invalid');
        }
        infoMessage.classList.add('text-success');
        infoMessage.innerHTML = state.registrationProcess.infoMessage;
        form.insertAdjacentElement('afterend', infoMessage);
        renderPosts(state, postsContainer);
        renderFeeds(state, feedsContainer);
      }
    }
  };
  return onChange(state, render);
};
