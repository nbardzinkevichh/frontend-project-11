import onChange from "on-change";

export default (state) => {
  const render = (path, value, previousValue) => {
    const input = document.querySelector('#url-input');
    const form = document.querySelector('form');
    if (path === 'registrationProcess.state') {
      if (value === 'failed') {
        const pError = document.createElement('p');
        pError.classList.add('feedback', 'm-0', 'position-absolute', 'small', 'text-danger');
        pError.innerHTML = state.registrationProcess.error.message;
        form.insertAdjacentElement('afterend', pError);
        input.classList.add('is-invalid');
      }
      if (value === 'processing') {
        const errorMessage = document.querySelector('.feedback');
        form.reset();
        input.focus();
        errorMessage.remove();
        input.classList.remove('is-invalid');
      }
    }
  };
  return onChange(state, render);
};