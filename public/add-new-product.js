const form = document.getElementById("add-product-form");
const btnSubmit = document.getElementById("btn-add-prod-submit");
const radioBtns = Array.from(document.querySelectorAll("input[type='radio']"));
const idInputWrapper = document.getElementById("product-id-input-wrapper");

function uncheckRadioBtns() {
  radioBtns.forEach((btn) => {
    btn.checked = false;
  });
}
uncheckRadioBtns();

const formChildren = Array.from(form.children);
function changeInputDisplay(display) {
  formChildren.forEach((item) => {
    item.style.display = display;
  });
}

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
      break;
    default:
      break;
  }
}

radioBtns.forEach((btn) => {
  btn.addEventListener("change", handleRadioBtn);
});

function handleFormSubmit(e) {
  e.preventDefault();
  const formData = new FormData(form);
  // console.log(formData);
  form.reset();
}

btnSubmit.addEventListener("click", handleFormSubmit);
