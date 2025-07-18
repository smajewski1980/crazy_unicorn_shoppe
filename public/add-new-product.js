const form = document.getElementById("add-product-form");
const btnSubmit = document.getElementById("btn-add-prod-submit");

function handleFormSubmit(e) {
  e.preventDefault();
  const formData = new FormData(form);
  console.log(formData);
  form.reset();
}

btnSubmit.addEventListener("click", handleFormSubmit);
