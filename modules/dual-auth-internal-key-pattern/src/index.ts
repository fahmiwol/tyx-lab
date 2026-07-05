// Proxy forwards client request to backend
const headers = {
  'Authorization': `Bearer ${userJwt}`,
  'x-internal-key': process.env.INTERNAL_API_KEY,
};

const res = await fetch('http://bank/transfer', {
  method: 'POST',
  headers,
  body: JSON.stringify({ amount, denom }),
});

// Backend validates:
const userJwt = req.headers['authorization']?.replace('Bearer ', '');
const internalKey = req.headers['x-internal-key'];
const auth = await validateDualAuth({ userJwt, internalKey });
if (!auth.authorized) res.status(401).send('Unauthorized');