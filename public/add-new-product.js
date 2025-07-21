const form = document.getElementById("add-product-form");
const btnSubmit = document.getElementById("btn-add-prod-submit");
const radioBtns = Array.from(document.querySelectorAll("input[type='radio']"));
const idInputWrapper = document.getElementById("product-id-input-wrapper");
const btnEnterId = document.getElementById("btn-enter-id");

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
      // need to change this to take in the id, then retrieve the info to edit <-------
      changeInputDisplay("block");
      btnEnterId.style.display = "block";
      break;
    case "delete-product":
      changeInputDisplay("none");
      idInputWrapper.style.display = "block";
      btnEnterId.style.display = "none";
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
// this populates the form fields with the data for the entered products id to edit
async function handlePopulateFormData(e) {
  e.preventDefault();
  const id = form[0].value;
  const response = await fetch(`/products/${id}`);
  if (!response.ok) {
    console.log("that is not a valid product id");
    return;
  }
  const data = await response.json();
  const {
    product_name,
    product_description,
    product_price,
    image_url,
    category_id,
    current_qty,
    min_qty,
    max_qty,
  } = data;
  form[2].value = product_name;
  form[3].value = product_description;
  form[4].value = product_price;
  form[5].value = image_url;
  form[6].value = category_id;
  form[7].value = current_qty;
  form[8].value = min_qty;
  form[9].value = max_qty;
}

btnEnterId.addEventListener("click", handlePopulateFormData);

radioBtns.forEach((btn) => {
  btn.addEventListener("change", handleRadioBtn);
});

btnSubmit.addEventListener("click", handleFormSubmit);
