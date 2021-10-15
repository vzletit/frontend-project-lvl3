import * as yup from 'yup';

export default (objToValidate, arrayToSearchIn) => {
  const schema = yup.object().shape({
    url: yup
      .string()
      .test(
        // We cannot use notOneOf with variable (dynamical) array. See: https://github.com/jquense/yup/issues/337
        // So, we use .test with NO-ARROW function inside.
        'Check for uniqueness',
        'errors.notUniq',
        function test(value) {
          let result = true;
          this.options.context.forEach((item) => {
            result = item.url !== value;
          });
          return result;
        },
      )
      .required('errors.empty')
      .url('errors.notValidUrl'),
  });

  // variable (dynamical) array can be passed as context via 2nd argument for yup.string().test
  // see:  https://github.com/jquense/yup#mixedtestname-string-message-string--function-test-function-schema
  return schema.validate(objToValidate, { context: arrayToSearchIn }).catch((err) => {
    throw new Error(err.message);
  });
};
