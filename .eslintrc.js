module.exports = {
    "extends": "airbnb",
    "env": {
      "es6": true,
      "browser": true,
      "jest": true,
    },
    "plugins": [
      "react",
      "flowtype"
    ],
    "parser": "babel-eslint",
    "globals": {
      "fetch": false,
      "SyntheticEvent": true,
      "SyntheticInputEvent": true,
      "$ReadOnlyArray": true,
    },
    "rules": {
      "react/prefer-stateless-function": "off",
      "camelcase": "off",
    }
};
