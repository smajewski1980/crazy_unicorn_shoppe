const form = document.getElementById('sign-up-form');
const btnSignup = document.getElementById('btn-signup');

async function sendFormData(data) {
  const options = {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(data),
  };

  const response = await fetch('/user/register', options);
  const resData = await response.json();
  console.log(resData);
}

function handleSignup(e) {
  e.preventDefault();
  const formData = new FormData(form);
  const dataObject = Object.fromEntries(formData);
  sendFormData(dataObject);
  form.reset();
}

btnSignup.addEventListener('click', handleSignup);
