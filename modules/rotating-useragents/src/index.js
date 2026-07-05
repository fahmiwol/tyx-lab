const ua = require('@tiranyx/useragents');
const userAgent = ua.random();  // Random weighted
const desktop = ua.randomDesktop();
const mobile = ua.randomMobile();
ua.detectFamily(userAgent);  // 'chrome'|'firefox'|...
ua.secChUa(userAgent);       // Sec-Ch-Ua header value