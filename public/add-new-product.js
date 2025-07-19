const form = document.getElementById("add-product-form");
const btnSubmit = document.getElementById("btn-add-prod-submit");
const radioBtns = Array.from(document.querySelectorAll("input[type='radio']"));

function checkRadioBtns() {
  let checked;
  radioBtns.forEach((btn) => {
    if (btn.checked) {
      checked = btn.value;
    }
  });
  return checked;
}

function handleFormSubmit(e) {
  e.preventDefault();
  const formData = new FormData(form);
  // console.log(formData);
  console.log(checkRadioBtns());
  form.reset();
}

btnSubmit.addEventListener("click", handleFormSubmit);
