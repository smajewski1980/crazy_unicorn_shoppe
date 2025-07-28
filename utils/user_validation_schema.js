const userValidationSchema = {
  name: {
    notEmpty: {
      errorMessage: 'Name field must not be empty.',
    },
    isString: {
      errorMessage: 'Name field must be a string.',
    },
    escape: true,
  },
  password: {
    isLength: {
      options: {
        min: 8,
        max: 20,
      },
      errorMessage: 'The password must be between 8 and 20 characters.',
    },
    escape: true,
  },
  email: {
    isEmail: {
      errorMessage: 'Email must be in the form of a valid email address.',
    },
    normalizeEmail: true,
    escape: true,
  },
  phone: {
    isMobilePhone: {
      errorMessage: 'Phone number must be in the format 555-555-5555.',
    },
    escape: true,
  },
  address_line_1: {
    isLength: {
      options: {
        min: 5,
        max: 50,
      },
      errorMessage: 'Address line 1 must be between 5 and 50 characters.',
    },
    escape: true,
  },
  address_line_2: {
    optional: true,
    isLength: {
      options: {
        max: 50,
      },
      errorMessage: 'Address line 2 must be less than 50 characters.',
    },
    escape: true,
  },
  city: {
    isLength: {
      options: {
        min: 3,
        max: 50,
      },
      errorMessage: 'City must be between 3 and 50 characters.',
    },
    escape: true,
  },
  state: {
    isLength: {
      options: {
        min: 2,
        max: 2,
      },
      errorMessage: 'Please enter the 2 character state abbreviation.',
    },
    escape: true,
  },
  zip_code: {
    isLength: {
      options: {
        min: 5,
        max: 10,
      },
      errorMessage: 'Zip code must be between 5 and 10 characters.',
    },
    escape: true,
  },
};

module.exports = { userValidationSchema };
