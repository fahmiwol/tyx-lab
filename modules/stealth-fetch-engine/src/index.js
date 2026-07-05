const { fetch, get, post } = require('@tiranyx/stealth-fetch');
const r = await get('https://example.com');
console.log(r.status, r.data);