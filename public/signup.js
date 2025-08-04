const form = document.getElementById('sign-up-form');
const btnSignup = document.getElementById('btn-signup');
const pw = document.getElementById('input-password');
const confpw = document.getElementById('input-conf-password');

async function sendFormData(data) {
  const options = {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(data),
  };

  const response = await fetch('/user/register', options);
  // const resData = await response.json();
  if (response.ok) {
    window.location.href = './signin.html';
  }
}

function handleSignup(e) {
  e.preventDefault();
  const formData = new FormData(form);
  const dataObject = Object.fromEntries(formData);
  sendFormData(dataObject);
  // form.reset();
}

btnSignup.addEventListener('click', handleSignup);

function doPasswordsMatch() {
  const password = pw.value;
  const confPassword = confpw.value;
  const match = password === confPassword;

  if (match) {
    confpw.setCustomValidity('');
    confpw.classList.add('validity-style');
  } else {
    confpw.setCustomValidity('passwords dont match');
  }

  // console.log(match);
}

confpw.addEventListener('input', doPasswordsMatch);
