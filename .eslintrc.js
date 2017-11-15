module.exports = {
    "extends": "airbnb",
    "env": {
      "es6": true,
      "browser": true,
      "jest": true,
    },
    "plugins": [
      "react"
    ],
    "parser": "babel-eslint",
    "globals": {
      "fetch": false,
      "SyntheticEvent": true,
      "SyntheticInputEvent": true,
    },
    "rules": {
      "react/prefer-stateless-function": "off",
      "camelcase": "off",
    }
};
