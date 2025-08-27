import { toasty } from './utils/toasty.js';
const nameInput = document.getElementById('name');
const thoughtInput = document.getElementById('thought');
const btnThought = document.getElementById('btn-thought');
const form = document.getElementById('form-thought');

async function handleThought(e) {
  e.preventDefault();
  const name = nameInput.value;
  const thought = thoughtInput.value;

  // check for both fields being filled out
  if (!name || !thought) {
    return toasty('Both fields need to be filled out please.');
  }

  const options = {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ name, thought }),
  };

  const response = await fetch('./user/thought', options);

  if (response.ok) {
    nameInput.value = '';
    thoughtInput.value = '';
    form.inert = true;
    toasty('Your thought has been submitted.', 'home');
    return;
  } else if (response.status === '500') {
    return toasty('There was a server problem, please try again.');
  }

  // handle any server anomolies
  const msg = await response.json();
  return toasty(await msg);
}

btnThought.addEventListener('click', handleThought);

// form.addEventListener('submit', (e) => {
//   e.preventDefault();
// });
