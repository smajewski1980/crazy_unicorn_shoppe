const thoughtSchema = {
  name: {
    notEmpty: {
      errorMessage: 'Name field must not be empty.',
    },
    isString: {
      errorMessage: 'Name field must be a string.',
    },
    escape: true,
  },
  thought: {
    notEmpty: {
      errorMessage: 'Name field must not be empty.',
    },
    isLength: {
      options: {
        min: 1,
        max: 500,
      },
      errorMessage: 'Thought must be 500 characters or less.',
    },
    escape: true,
  },
};

module.exports = { thoughtSchema };
