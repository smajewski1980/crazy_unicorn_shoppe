const form = document.getElementById("add-product-form");
const btnSubmit = document.getElementById("btn-add-prod-submit");
const radioBtns = Array.from(document.querySelectorAll("input[type='radio']"));
const idInputWrapper = document.getElementById("product-id-input-wrapper");

function uncheckRadioBtns() {
  radioBtns.forEach((btn) => {
    btn.checked = false;
  });
}
// make sure they are unchecked on reload
uncheckRadioBtns();

const formChildren = Array.from(form.children);
// this func sets all form inputs to a display setting arg
function changeInputDisplay(display) {
  formChildren.forEach((item) => {
    item.style.display = display;
  });
}
// set up the appropriate form fields depending on which btn is checked
function handleRadioBtn(e) {
  switch (e.target.value) {
    case "add-product":
      changeInputDisplay("block");
      idInputWrapper.style.display = "none";
      break;
    case "update-product":
      changeInputDisplay("block");
      break;
    case "delete-product":
      changeInputDisplay("none");
      idInputWrapper.style.display = "block";
      btnSubmit.style.display = "block";
      break;
    default:
      break;
  }
}
// gets the value of whichever radio btn is checked
function checkedRadioVal() {
  let val;
  radioBtns.forEach((btn) => {
    if (btn.checked) {
      val = btn.value;
    }
  });
  return val;
}

// submission handlers
async function addProduct(formData) {
  const json = JSON.stringify(Object.fromEntries(formData));
  const response = await fetch("/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: json,
  });
  console.log(response);
}
async function updateProduct(formData) {
  const id = formData.get("product_id");
  const json = JSON.stringify(Object.fromEntries(formData));
  const response = await fetch(`/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: json,
  });
  console.log(response);
}
async function deleteProduct(formData) {
  const id = formData.get("product_id");
  const response = await fetch(`/products/${id}`, { method: "DELETE" });
  console.log(response);
}

function handleFormSubmit(e) {
  e.preventDefault();
  const formData = new FormData(form);
  const action = checkedRadioVal();

  switch (action) {
    case "add-product":
      addProduct(formData);
      break;
    case "update-product":
      updateProduct(formData);
      break;
    case "delete-product":
      deleteProduct(formData);
      break;
    default:
      break;
  }

  form.reset();
  uncheckRadioBtns();
  changeInputDisplay("none");
}

radioBtns.forEach((btn) => {
  btn.addEventListener("change", handleRadioBtn);
});
btnSubmit.addEventListener("click", handleFormSubmit);
