// This file uses TypeScript's "declaration merging" — it doesn't create a new
// type, it ADDS fields to Express's existing Request interface globally.
// Because of this, `req.userId` and `req.userRole` become valid everywhere
// in the project without importing anything extra.

export {};

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: string;
    }
  }
}


//Socho Request object Express ka apna diya hua "form" hai — usmein by default body, params, headers jaise fields hote hain. Hum apna khud ka field (userId) daal rahe hain us form mein (req.userId = decoded.userId), lekin TypeScript ke paas us form ka "updated blueprint" nahi hai.

// express.d.ts us blueprint ko globally update kar deta hai — "Express ke Request mein ab userId aur userRole bhi honge". Isके baad poore project mein kahin bhi req.userId likho, TypeScript samajh jaayega.