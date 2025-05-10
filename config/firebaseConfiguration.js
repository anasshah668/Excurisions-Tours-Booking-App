import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const serviceAccount = require("./firebaseKey.json");

const app = initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore(app);
export default db;
