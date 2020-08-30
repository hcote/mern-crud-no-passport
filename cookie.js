const Iron = require("@hapi/iron");

/* defining the cookie attributes */
const cookie = {
  maxAge: 60 * 60, // 1 hour
  secure: false, // set `true` for https only
  path: "/", // send the cookie on all requests
  httpOnly: true, // makes cookie inaccessible from browser (only transfered through http requests, and protects against XSS attacks)
  sameSite: "strict", // cookie can only be sent from the same domain
};

const decryptCookie = async (cookie) => {
  return await Iron.unseal(cookie, process.env.ENCRYPTION_SECRET, Iron.defaults);
};

const encryptCookie = async (userMetadata) => {
  return await Iron.seal(userMetadata, process.env.ENCRYPTION_SECRET, Iron.defaults);
};

module.exports = { cookie, decryptCookie, encryptCookie };
