const btnLogout = document.querySelector(".icons-wrapper img:last-child");
btnLogout.style.cursor = "pointer";
function handleLogout() {
  fetch("/user/logout");
  alert("user is now logged out");
}

btnLogout.addEventListener("click", handleLogout);
