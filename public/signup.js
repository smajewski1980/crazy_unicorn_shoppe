const form = document.getElementById('sign-up-form');
const btnSignup = document.getElementById('btn-signup');
const pw = document.getElementById('input-password');
const confpw = document.getElementById('input-conf-password');

const nameField = document.getElementById('input-name');
const nameFieldLabel = document.getElementById('name-label');
const pwField = document.getElementById('input-password');
const confPwField = document.getElementById('input-conf-password');
const emailField = document.getElementById('input-email');
const formLeftCol = document.getElementById('sign-up-form-left-col');

function updateFormForGoogleLogin(name, id, email) {
  // need to make seperate classes for google or not forms and toggle here
  nameField.value = name;
  nameFieldLabel.textContent = 'google username';
  nameField.readOnly = true;
  pwField.value = id;
  // pwField.closest('div').style.visibility = 'hidden';
  confPwField.value = id;
  // confPwField.closest('div').style.visibility = 'hidden';
  emailField.value = email;
  emailField.readOnly = true;
  formLeftCol.classList.add('google-signup');
}

async function getStatus() {
  const response = await fetch('/user/status');
  const data = await response.json();
  console.log(data);
  if (data.provider === 'google') {
    const googleName = data.displayName;
    const googleID = data.id;
    const googleEmail = data.emails[0].value;
    updateFormForGoogleLogin(googleName, googleID, googleEmail);
    return;
  }
  if (data.user_id) {
    window.location.href = 'index.html';
  }
  return;
}

getStatus();

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
