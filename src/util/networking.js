const headers = new Headers({
   'Content-Type': 'application/json',
   'Accept': 'application/json'
});


const doRequest = (url, method, content = {}) => {
   return fetch(
      new Request(url, { headers }),
      {
         method: method,
         credentials: 'include',
         body: method === 'GET' ? undefined :  JSON.stringify(content)
      })
      .then((res) => res.json() )
      .then((res) => {
         if (res.errors) {
            throw res.errors;
         }
         return res;
      })
      .catch((errors) => {
         let error = errors;
         if (Array.isArray(errors)) {
            error = errors[0];
         }
         console.error(error);
      });
};

export default {
   get: (url, content) => {
      return doRequest(url, 'GET', content);
   },
   post: (url, content) => {
      return doRequest(url, 'POST', content);
   },
}
