import Cookies from 'js-cookie';

const { Network } = require('relay-runtime');

// Define a function that fetches the results of an operation (query/mutation/etc)
// and returns its results as a Promise:
function fetchQuery(
  operation,
  variables,
) {
  return fetch('/graphql', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      // Add authentication and other headers here
      'content-type': 'application/json',
      'X-CSRFToken': Cookies.get('csrftoken'),
    },
    body: JSON.stringify({
      query: operation.text, // GraphQL text from input
      variables,
    }),
  }).then(response => response.json());
}

// Create a network layer from the fetch function
export default Network.create(fetchQuery);
