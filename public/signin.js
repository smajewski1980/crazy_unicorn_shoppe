const form = document.getElementById('form-login');
const btnLogin = document.getElementById('btn-login');

async function sendFormData(data) {
  const options = {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(data),
  };

  const response = await fetch('/user/login', options);
  if (response.ok) {
    window.location.href = response.url;
  } else {
    form.reset();
    alert('Invalid credentials, please try again');
  }
  console.log(response);
}

function handleLogin(e) {
  e.preventDefault();
  const formData = new FormData(form);
  const dataObject = Object.fromEntries(formData);
  if (form.checkValidity()) {
    sendFormData(dataObject);
  } else alert('Please fill out the required fields');
}

btnLogin.addEventListener('click', handleLogin);

const btnGoogle = document.querySelector('.gsi-material-button');

btnGoogle.addEventListener('click', (e) => {
  e.preventDefault();
  window.location.href = '/user/auth/google';
});
