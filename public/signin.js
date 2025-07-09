const form = document.getElementById("form-login");
const btnLogin = document.getElementById("btn-login");

async function sendFormData(data) {
  const options = {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(data),
  };

  const response = await fetch("/user/login", options);
  if (response.ok) {
    window.location.href = response.url;
  }
  console.log(response);
}

function handleLogin(e) {
  e.preventDefault();
  const formData = new FormData(form);
  const dataObject = Object.fromEntries(formData);
  sendFormData(dataObject);
}

btnLogin.addEventListener("click", handleLogin);
