const { createQuotaTracker } = require('@tiranyx/quota-tracker');
const tracker = createQuotaTracker(adminStore);
tracker.log({ provider: 'runpod-chat', units: 7 });
const summary = tracker.summary();