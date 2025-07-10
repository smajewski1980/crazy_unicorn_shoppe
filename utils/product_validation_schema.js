const baseProductValidationSchema = {
  product_name: {
    notEmpty: {
      errorMessage: "product name must not be empty",
    },
    isString: {
      errorMessage: "product name must be a string",
    },
    escape: true,
  },
  product_description: {
    notEmpty: {
      errorMessage: "please provide a description",
    },
    isString: {
      errorMessage: "product name must be a string",
    },
    escape: true,
  },
  product_price: {
    notEmpty: {
      errorMessage: "please provide a price",
    },
    isInt: {
      errorMessage: "price must be a number",
    },
  },
  image_url: {
    notEmpty: {
      errorMessage: "please include a url for the image",
    },
    escape: true,
  },
  category_id: {
    notEmpty: {
      errorMessage: "a category must be entered",
    },
    isInt: {
      errorMessage: "category id must be a number",
    },
  },
};

const putInventoryValidationSchema = {
  current_qty: {
    notEmpty: {
      errorMessage: "a quantity must be entered, 0 for none.",
    },
    isInt: {
      errorMessage: "quantity must be a number",
    },
  },
};

const productValidationSchema = {
  ...baseProductValidationSchema,
  current_qty: {
    notEmpty: {
      errorMessage: "a quantity must be entered, 0 for none.",
    },
    isInt: {
      errorMessage: "quantity must be a number",
    },
  },
  min_qty: {
    notEmpty: {
      errorMessage: "a minimum quantity must be entered.",
    },
    isInt: {
      errorMessage: "quantity must be a number",
    },
  },
  max_qty: {
    notEmpty: {
      errorMessage: "a maximum quantity must be entered.",
    },
    isInt: {
      errorMessage: "quantity must be a number",
    },
  },
};

module.exports = {
  productValidationSchema,
  baseProductValidationSchema,
  putInventoryValidationSchema,
};
