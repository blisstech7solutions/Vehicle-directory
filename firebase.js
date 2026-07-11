function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function ensureFirebaseReady() {
  if (!auth || !db) {
    throw new Error("Firebase is not configured correctly. Please update firebase-config.js with the correct project credentials from Firebase Console.");
  }
}

async function loginAdmin(email, password) {
  ensureFirebaseReady();
  return auth.signInWithEmailAndPassword(email, password);
}

function logoutAdmin() {
  ensureFirebaseReady();
  return auth.signOut();
}

async function getVehicles() {
  ensureFirebaseReady();
  const snapshot = await db.collection("vehicles").orderBy("createdAt", "desc").get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function addVehicle(vehicle) {
  ensureFirebaseReady();
  return db.collection("vehicles").add({
    ...vehicle,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}

async function updateVehicle(vehicleId, vehicle) {
  ensureFirebaseReady();
  return db.collection("vehicles").doc(vehicleId).update({
    ...vehicle,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}

async function deleteVehicle(vehicleId) {
  ensureFirebaseReady();
  return db.collection("vehicles").doc(vehicleId).delete();
}
