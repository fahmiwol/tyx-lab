const { random, betweenRequests } = require('@tiranyx/timing');
await betweenRequests();  // Before fetching next URL
const page = await fetch(url);