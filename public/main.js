import { toasty } from './utils/toasty.js';
const btnLogout = document.querySelector('.icons-wrapper img:last-child');
btnLogout.style.cursor = 'pointer';
const navFirstItem = document.querySelector('nav ul li:first-child');

async function getUser() {
  try {
    const response = fetch('/user/status');
    const userData = (await response).json();
    return userData;
  } catch (error) {
    console.log(error);
  }
}

function styleLogOut() {
  navFirstItem.style.rotate = '0deg';
  navFirstItem.querySelector('p:first-child').style.margin = '0';
  // navFirstItem.querySelector('p:last-child').style.margin = '0';
  navFirstItem.style.display = 'grid';
  navFirstItem.style.placeItems = 'center';
}

async function isLoggedIn() {
  // if a user is logged in on page load, load appropriate UI
  try {
    const response = await getUser();
    // when i set up the endpoint, i had it return {msg: not authenticated} if not logged in
    if (!response.msg) {
      console.log('user is logged in');
      navFirstItem.innerHTML = `
        <p>Logged in as ${response.name}.</p>
        <button id="logout-link">LOGOUT</button>
      `;
      document
        .getElementById('logout-link')
        .addEventListener('click', handleLogout);
      styleLogOut();
      return;
    }
    console.log('user is not logged in');
    navFirstItem.innerHTML = `
            <a href="./signin.html">
              <img
                src="./assets/images/button.webp"
                alt=""
              />
            </a>
    `;
    return;
  } catch (error) {
    console.log(error);
  }
}

isLoggedIn();

async function handleLogout() {
  const user = await getUser();
  const name = await user.name;
  fetch('/user/logout');
  if (user.msg) {
    toasty('There is no one logged in.');
    return;
  }
  toasty(`${name} is now logged out`, 'home');
}

btnLogout.addEventListener('click', handleLogout);
