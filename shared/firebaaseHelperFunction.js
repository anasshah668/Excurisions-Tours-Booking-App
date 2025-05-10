// firebaseService.js
import db from "../config/firebaseConfiguration"; // your initialized Firestore DB

/**
 * Create a new document
 */
export const createDoc = async (collectionName, data) => {
  const docRef = await db.collection(collectionName).add(data);
  return { id: docRef.id, ...data };
};

/**
 * Read document by ID
 */
export const getDocById = async (collectionName, docId) => {
  const docRef = db.collection(collectionName).doc(docId);
  const doc = await docRef.get();
  if (!doc.exists) throw new Error("Document not found");
  return { id: doc.id, ...doc.data() };
};

/**
 * Read all documents in a collection
 */
export const getAllDocs = async (collectionName) => {
  const snapshot = await db.collection(collectionName).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

/**
 * Update a document
 */
export const updateDoc = async (collectionName, docId, updates) => {
  const docRef = db.collection(collectionName).doc(docId);
  await docRef.update(updates);
  return { id: docId, ...updates };
};

/**
 * Delete a document
 */
export const deleteDoc = async (collectionName, docId) => {
  const docRef = db.collection(collectionName).doc(docId);
  await docRef.delete();
  return { message: `Document ${docId} deleted.` };
};
