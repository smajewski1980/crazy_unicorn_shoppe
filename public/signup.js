const form = document.getElementById('sign-up-form');
const btnSignup = document.getElementById('btn-signup');
const pw = document.getElementById('input-password');
const confpw = document.getElementById('input-conf-password');
const h1El = document.querySelector('h1');
const nameField = document.getElementById('input-name');
const nameFieldLabel = document.getElementById('name-label');
const pwField = document.getElementById('input-password');
const confPwField = document.getElementById('input-conf-password');
const emailField = document.getElementById('input-email');
const formLeftCol = document.getElementById('sign-up-form-left-col');
const fieldset = document.querySelector('fieldset');
const btnHome = document.getElementById('home-link');
const logo = document.querySelector('.logo-wrapper');
const redirectImage = document.getElementById('redirect-image-wrapper');

let isGoogleSignup = false;

function updateFormForGoogleLogin(name, id, email) {
  nameField.value = name;
  nameFieldLabel.textContent = 'google username';
  nameField.readOnly = true;
  pwField.value = id;
  confPwField.value = id;
  emailField.value = email;
  emailField.readOnly = true;
  fieldset.classList.remove('unicorn-float');
  formLeftCol.classList.add('google-signup');
  isGoogleSignup = true;
  btnHome.style.display = 'none';
  showSignUpPageElements();
}

async function getStatus() {
  const response = await fetch('/user/status');
  const data = await response.json();
  // console.log(data);
  if (data.user_id) {
    redirectImage.style.display = 'block';
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1500);
    return;
  }
  if (data.provider === 'google') {
    const googleName = data.displayName;
    const googleID = data.id;
    const googleEmail = data.emails[0].value;
    updateFormForGoogleLogin(googleName, googleID, googleEmail);
    return;
  }
  showSignUpPageElements();
  return;
}

function showSignUpPageElements() {
  form.style.display = 'flex';
  h1El.style.display = 'block';
  logo.style.display = 'block';
  if (!isGoogleSignup) {
    btnHome.style.display = 'inline-block';
  }
  return;
}

getStatus();

async function sendFormData(data) {
  const uniqueEmailErr =
    'error: duplicate key value violates unique constraint "users_email_unique"';

  const options = {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(data),
  };

  const response = await fetch('/user/register', options);

  if (!response.ok) {
    const data = await response.json();
    console.log(await data);
    if (data.errors) {
      data.errors.forEach((err) => {
        console.log(err.msg);
        alert(err.msg);
      });
      return;
    }
    if (data === uniqueEmailErr) {
      alert('that email is already taken, please choose another');
    }
  }

  // local signup, logs in and redirects home
  if (response.ok && !isGoogleSignup) {
    console.log(data);
    options.body = JSON.stringify({
      username: data.name,
      password: data.password,
    });
    const response = await fetch('/user/login', options);
    if (response.ok) {
      window.location.href = './index.html';
    }
  }

  // google sign up redirects to google auth endpoint
  // which will ultimately redirect to the homepage
  if (response.ok && isGoogleSignup) {
    window.location.href = '/user/auth/google';
  }

  return;
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
