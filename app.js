const state = {
  user: null,
  vehicles: [],
  searchTerm: "",
  editingVehicleId: null,
  deletingVehicleId: null,
  confirmationResult: null,
  lastMatchedVehicle: null
};

function readStoredVehicles() {
  try {
    const raw = localStorage.getItem("nakshatraVehicles");
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
}

function persistStoredVehicles(vehicles) {
  // Disabled: app now relies solely on Firestore for persistence.
}

function createLocalVehicleId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const loginSection = document.getElementById("loginSection");
const appSection = document.getElementById("app");
const loginPanel = document.getElementById("loginPanel");
const adminLoginBtn = document.getElementById("adminLoginBtn");
const phoneForm = document.getElementById("phoneForm");
const otpForm = document.getElementById("otpForm");
const phoneNumberInput = document.getElementById("phoneNumber");
const otpCodeInput = document.getElementById("otpCode");
const authMessage = document.getElementById("authMessage");
const userBadge = document.getElementById("userBadge");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const addVehicleBtn = document.getElementById("addVehicleBtn");
const parkingShortcutBtn = document.getElementById("parkingShortcutBtn");
const vehiclesList = document.getElementById("vehiclesList");
const resultsCount = document.getElementById("resultsCount");

const vehicleModal = document.getElementById("vehicleModal");
const modalTitle = document.getElementById("modalTitle");
const vehicleForm = document.getElementById("vehicleForm");
const vehicleIdField = document.getElementById("vehicleIdField");
const vehicleNumberInput = document.getElementById("vehicleNumber");
const ownerNameInput = document.getElementById("ownerName");
const flatNumberInput = document.getElementById("flatNumber");
const mobileInput = document.getElementById("mobile");
const formMessage = document.getElementById("formMessage");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModalBtn = document.getElementById("cancelModalBtn");

const deleteModal = document.getElementById("deleteModal");
const deleteVehicleLabel = document.getElementById("deleteVehicleLabel");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const ownerNameInputMsg = document.getElementById("ownerNameInputMsg");
const parkingPlaceInput = document.getElementById("parkingPlaceInput");
const parkingLookupInput = document.getElementById("parkingLookupInput");
const durationInput = document.getElementById("durationInput");
const whatsappMessageBtn = document.getElementById("whatsappMessageBtn");
const findOwnerBtn = document.getElementById("findOwnerBtn");

function showAuthView(isLoggedIn) {
  loginSection.classList.toggle("hidden", true);
  appSection.classList.toggle("hidden", false);
  addVehicleBtn.classList.remove("hidden");
}

const toastEl = document.getElementById("toast");
const loaderOverlay = document.getElementById("loaderOverlay");

function setMessage(element, message, isError = false) {
  element.textContent = message;
  element.style.color = isError ? "#e23d3d" : "#1353b0";
}

function showToast(message, isError = false) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.className = `toast visible${isError ? ' error' : ''}`;
  window.clearTimeout(toastEl.hideTimer);
  toastEl.hideTimer = window.setTimeout(() => {
    toastEl.className = 'toast hidden';
  }, 2800);
}

function showLoader(show = true) {
  if (!loaderOverlay) return;
  loaderOverlay.classList.toggle('hidden', !show);
}

function clearForm() {
  vehicleForm.reset();
  vehicleIdField.value = "";
  state.editingVehicleId = null;
  formMessage.textContent = "";
}

function scrollToParkingFeature() {
  const parkingSection = document.getElementById("parkingSection");
  if (parkingSection) {
    parkingSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function formatVehicleNumber(value) {
  const raw = String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!raw) return "";

  const bhMatch = raw.match(/^(BH)(\d{1,2})([A-Z]{1,2})(\d{1,4})$/);
  if (bhMatch) {
    return `${bhMatch[1]} ${bhMatch[2]} ${bhMatch[3]} ${bhMatch[4]}`;
  }

  const standardMatch = raw.match(/^([A-Z]{2})(\d{1,2})([A-Z]{1,2})(\d{1,4})$/);
  if (standardMatch) {
    return `${standardMatch[1]} ${standardMatch[2]} ${standardMatch[3]} ${standardMatch[4]}`;
  }

  const altMatch = raw.match(/^(\d{2})([A-Z]{2})(\d{1,4})([A-Z]?)$/);
  if (altMatch) {
    return `${altMatch[1]} ${altMatch[2]} ${altMatch[3]}${altMatch[4] ? ` ${altMatch[4]}` : ""}`;
  }

  return raw.replace(/([A-Z]{2})(\d{1,2})([A-Z]{1,2})(\d{1,4})/, "$1 $2 $3 $4");
}

function formatFlatNumber(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";

  const digits = trimmed.match(/\d+/);
  if (digits) {
    return `E-${digits[0]}`;
  }

  const sanitized = trimmed.replace(/[^A-Z0-9]+/gi, "").toUpperCase();
  return sanitized;
}

function openVehicleModal(vehicle = null) {
  clearForm();
  if (vehicle) {
    modalTitle.textContent = "Edit Vehicle";
    vehicleIdField.value = vehicle.id;
    vehicleNumberInput.value = vehicle.vehicleNumber || "";
    ownerNameInput.value = vehicle.ownerName || "";
    flatNumberInput.value = formatFlatNumber(vehicle.flatNumber || "");
    mobileInput.value = vehicle.mobile || "";
    const typeInputs = document.querySelectorAll('input[name="vehicleType"]');
    typeInputs.forEach((input) => {
      input.checked = input.value === (vehicle.vehicleType || "4 Wheeler");
    });
    state.editingVehicleId = vehicle.id;
  } else {
    modalTitle.textContent = "Add Vehicle";
    document.querySelector('input[name="vehicleType"][value="4 Wheeler"]').checked = true;
  }
  vehicleModal.classList.remove("hidden");
  document.body.classList.add("modal-open");
}

function closeVehicleModal() {
  vehicleModal.classList.add("hidden");
  document.body.classList.remove("modal-open");
  clearForm();
}

function handleVehicleAction(vehicleId, action) {
  const vehicle = state.vehicles.find((item) => item.id === vehicleId);
  if (!vehicle) return;

  if (action === "edit") {
    openVehicleModal(vehicle);
    return;
  }

  if (action === "delete") {
    openDeleteModal(vehicle);
  }
}

window.openVehicleModal = openVehicleModal;
window.handleVehicleAction = handleVehicleAction;

function openDeleteModal(vehicle) {
  state.deletingVehicleId = vehicle.id;
  deleteVehicleLabel.textContent = `${vehicle.vehicleNumber || "Vehicle"} - ${vehicle.ownerName || "Owner"}`;
  deleteModal.classList.remove("hidden");
}

function closeDeleteModal() {
  state.deletingVehicleId = null;
  deleteModal.classList.add("hidden");
}

function getFilteredVehicles() {
  const query = normalizeText(state.searchTerm);
  if (!query) return state.vehicles;

  return state.vehicles.filter((vehicle) => {
    const fields = [vehicle.vehicleNumber, vehicle.flatNumber, vehicle.ownerName, vehicle.mobile];
    return fields.some((field) => normalizeText(field).includes(query));
  });
}

function renderVehicles() {
  const filtered = getFilteredVehicles().sort(sortByFlatNumber);
  resultsCount.textContent = `${filtered.length} vehicle${filtered.length === 1 ? "" : "s"}`;

  if (!filtered.length) {
    vehiclesList.innerHTML = '<div class="vehicle-card"><p>No matching vehicles found.</p></div>';
    return;
  }

  vehiclesList.innerHTML = filtered
    .map((vehicle) => {
      const vehicleType = vehicle.vehicleType || "4 Wheeler";
      const canManage = true;
      return `
        <article class="vehicle-card">
          <h4>${vehicle.vehicleNumber || "Vehicle Number"}</h4>
          <p><strong>Owner:</strong> ${vehicle.ownerName || "-"}</p>
          <p><strong>Flat:</strong> ${vehicle.flatNumber || "-"}</p>
          <p><strong>Mobile:</strong> ${vehicle.mobile || "-"}</p>
          <div class="vehicle-meta">
            <span class="badge">${vehicleType}</span>
          </div>
          <div class="card-actions icon-row">
            <a class="action-icon-btn" href="tel:${vehicle.mobile || ""}" title="Call"><span aria-hidden="true">📞</span><span class="sr-only">Call</span></a>
            ${canManage ? `<button class="action-icon-btn" type="button" title="Edit" onclick="window.handleVehicleAction('${vehicle.id}', 'edit')"><span aria-hidden="true">✏️</span><span class="sr-only">Edit</span></button>` : ""}
            ${canManage ? `<button class="action-icon-btn" type="button" title="Delete" onclick="window.handleVehicleAction('${vehicle.id}', 'delete')"><span aria-hidden="true">🗑️</span><span class="sr-only">Delete</span></button>` : ""}
          </div>
        </article>
      `;
    })
    .join("");
}

function sortByFlatNumber(a, b) {
  const normalize = (value) => {
    if (!value) return 0;
    const match = String(value).match(/(\d+)/);
    return match ? parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
  };

  return normalize(a.flatNumber) - normalize(b.flatNumber);
}

async function loadVehicles() {
  showLoader(true);
  try {
    const vehicles = await getVehicles();
    state.vehicles = vehicles;
    renderVehicles();
    addVehicleBtn.disabled = false;
    addVehicleBtn.classList.remove('hidden');
  } catch (error) {
    console.error('getVehicles error:', error);
    state.vehicles = [];
    renderVehicles();
    setMessage(authMessage, `Cannot load vehicles from Firestore: ${error && error.message ? error.message : 'unknown error'}`, true);
    showToast('Unable to load vehicles. Check Firebase access.', true);
    addVehicleBtn.disabled = false;
    addVehicleBtn.classList.remove('hidden');
  } finally {
    showLoader(false);
  }
}

function isDuplicateVehicle(vehicleNumber, currentId = null) {
  const normalized = normalizeText(vehicleNumber);
  return state.vehicles.some((vehicle) => {
    if (currentId && vehicle.id === currentId) return false;
    return normalizeText(vehicle.vehicleNumber) === normalized;
  });
}

async function handleVehicleSubmit(event) {
  event.preventDefault();
  const vehicleNumber = formatVehicleNumber(vehicleNumberInput.value);
  const ownerName = ownerNameInput.value.trim();
  const flatNumber = formatFlatNumber(flatNumberInput.value);
  const mobile = mobileInput.value.trim();
  const vehicleType = document.querySelector('input[name="vehicleType"]:checked').value;

  if (!vehicleNumber || !ownerName || !flatNumber || !mobile) {
    setMessage(formMessage, "Please fill in all required fields.", true);
    return;
  }

  if (isDuplicateVehicle(vehicleNumber, state.editingVehicleId)) {
    setMessage(formMessage, "A vehicle with this number already exists.", true);
    return;
  }

  const payload = {
    vehicleNumber,
    ownerName,
    flatNumber,
    mobile,
    vehicleType
  };

  try {
    showLoader(true);
    if (state.editingVehicleId) {
      await updateVehicle(state.editingVehicleId, payload);
      setMessage(formMessage, "Vehicle updated successfully.");
      showToast('Vehicle updated successfully.');
    } else {
      await addVehicle(payload);
      setMessage(formMessage, "Vehicle added successfully.");
      showToast('Vehicle added successfully.');
    }

    await loadVehicles();
    closeVehicleModal();
    setMessage(authMessage, state.editingVehicleId ? "Vehicle updated successfully." : "Vehicle added successfully.");
  } catch (error) {
    console.error('add/update vehicle error:', error);
    const errorMessage = `Unable to save vehicle to Firestore: ${error && error.message ? error.message : 'unknown error'}`;
    setMessage(formMessage, errorMessage, true);
    showToast(errorMessage, true);
  } finally {
    showLoader(false);
  }
}

async function handleDeleteConfirm() {
  if (!state.deletingVehicleId) return;

  try {
    showLoader(true);
    await deleteVehicle(state.deletingVehicleId);
    await loadVehicles();
    closeDeleteModal();
    showToast('Vehicle deleted successfully.');
  } catch (error) {
    console.error('delete vehicle error:', error);
    const errorMessage = `Unable to delete vehicle from Firestore: ${error && error.message ? error.message : 'unknown error'}`;
    setMessage(authMessage, errorMessage, true);
    showToast(errorMessage, true);
  } finally {
    showLoader(false);
  }
}

function initRecaptcha() {
  if (window.recaptchaVerifier) return window.recaptchaVerifier;

  window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier("recaptcha-container", {
    size: "invisible",
    callback: () => {},
    "expired-callback": () => {
      setMessage(authMessage, "OTP request expired. Please try again.", true);
    }
  }, auth);

  return window.recaptchaVerifier;
}

async function handleSendOtp(event) {
  event.preventDefault();
  const phoneNumber = phoneNumberInput.value.trim();

  if (!auth) {
    setMessage(authMessage, "Firebase is not configured correctly. Please update firebase-config.js with the correct project values from Firebase Console.", true);
    return;
  }

  if (!phoneNumber) {
    setMessage(authMessage, "Please enter your mobile number.", true);
    return;
  }

  try {
    const verifier = initRecaptcha();
    const confirmationResult = await auth.signInWithPhoneNumber(phoneNumber, verifier);
    state.confirmationResult = confirmationResult;
    otpForm.classList.remove("hidden");
    setMessage(authMessage, "OTP sent. Please enter the code to continue.");
  } catch (error) {
    setMessage(authMessage, error.message || "Unable to send OTP.", true);
  }
}

async function handleVerifyOtp(event) {
  event.preventDefault();
  const otpCode = otpCodeInput.value.trim();

  if (!auth) {
    setMessage(authMessage, "Firebase is not configured correctly. Please update firebase-config.js with the correct project values from Firebase Console.", true);
    return;
  }

  if (!otpCode) {
    setMessage(authMessage, "Please enter the OTP.", true);
    return;
  }

  try {
    if (!state.confirmationResult) {
      setMessage(authMessage, "Please request a new OTP first.", true);
      return;
    }

    await state.confirmationResult.confirm(otpCode);
    setMessage(authMessage, "Signing you in...");
  } catch (error) {
    setMessage(authMessage, error.message || "OTP verification failed.", true);
  }
}

function findParkingOwner() {
  const lookupValue = parkingLookupInput.value.trim();
  if (!lookupValue) {
    setMessage(authMessage, "Enter a flat number or parking number to find the owner.", true);
    return null;
  }

  const normalizedLookup = normalizeText(lookupValue);
  const matchedVehicle = state.vehicles.find((vehicle) => {
    const candidates = [vehicle.flatNumber, vehicle.vehicleNumber, vehicle.mobile];
    return candidates.some((candidate) => {
      const normalizedCandidate = normalizeText(candidate);
      return normalizedCandidate.includes(normalizedLookup) || normalizedLookup.includes(normalizedCandidate);
    });
  });

  if (!matchedVehicle) {
    state.lastMatchedVehicle = null;
    setMessage(authMessage, "No owner found for this number.", true);
    return null;
  }

  state.lastMatchedVehicle = matchedVehicle;
  ownerNameInputMsg.value = matchedVehicle.ownerName || "";
  parkingPlaceInput.value = matchedVehicle.flatNumber || "";
  generateParkingMessage();
  setMessage(authMessage, `Owner found: ${matchedVehicle.ownerName || "Unknown"}`);
  return matchedVehicle;
}

function generateParkingMessage() {
  const ownerName = ownerNameInputMsg.value.trim() || state.lastMatchedVehicle?.ownerName || "Owner";
  const parkingPlace = parkingPlaceInput.value.trim() || state.lastMatchedVehicle?.flatNumber || "your parking";
  const duration = durationInput.value.trim() || "10 min";

  return `Hi ${ownerName}, I have parked my vehicle in ${parkingPlace} for ${duration}. If you need your parking, you can contact me directly.`;
}

async function copyParkingMessage() {
  const message = generateParkingMessage();
  try {
    await navigator.clipboard.writeText(message);
    setMessage(authMessage, "Message copied to clipboard.");
  } catch (error) {
    setMessage(authMessage, "Copy failed. Please copy the message manually.", true);
  }
}

function normalizeWhatsAppNumber(value) {
  const raw = String(value || "");
  const tokens = raw.split(/[,;\/\s]+/).filter(Boolean);

  for (const token of tokens) {
    const digits = token.replace(/\D/g, "");

    if (digits.length === 10) {
      return `91${digits}`;
    }
    if (digits.length === 11 && digits.startsWith("0")) {
      return `91${digits.slice(1)}`;
    }
    if (digits.length === 12 && digits.startsWith("91")) {
      return digits;
    }
    if (digits.length === 13 && digits.startsWith("091")) {
      return digits.slice(1);
    }
  }

  return "";
}

function openWhatsAppMessage() {
  const message = generateParkingMessage();
  const encoded = encodeURIComponent(message);
  const ownerPhone = normalizeWhatsAppNumber(state.lastMatchedVehicle?.mobile || "");

  if (!ownerPhone) {
    setMessage(authMessage, "No valid phone number found for WhatsApp.", true);
    showToast("No valid WhatsApp number available.", true);
    return;
  }

  const targetUrl = `https://wa.me/${ownerPhone}?text=${encoded}`;
  window.location.href = targetUrl;
}

function bindEvents() {
  adminLoginBtn.addEventListener("click", () => {
    loginPanel.classList.toggle("hidden");
    authMessage.textContent = "";
  });
  phoneForm.addEventListener("submit", handleSendOtp);
  otpForm.addEventListener("submit", handleVerifyOtp);
  searchBtn.addEventListener("click", () => {
    state.searchTerm = searchInput.value;
    renderVehicles();
  });
  searchInput.addEventListener("input", (event) => {
    state.searchTerm = event.target.value;
    renderVehicles();
  });
  addVehicleBtn.addEventListener("click", () => openVehicleModal());
  closeModalBtn.addEventListener("click", closeVehicleModal);
  cancelModalBtn.addEventListener("click", closeVehicleModal);
  vehicleForm.addEventListener("submit", handleVehicleSubmit);
  cancelDeleteBtn.addEventListener("click", closeDeleteModal);
  confirmDeleteBtn.addEventListener("click", handleDeleteConfirm);
  parkingShortcutBtn.addEventListener("click", scrollToParkingFeature);
  findOwnerBtn.addEventListener("click", findParkingOwner);
  whatsappMessageBtn.addEventListener("click", openWhatsAppMessage);

  vehiclesList.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;

    const action = button.getAttribute("data-action");
    const vehicleId = button.getAttribute("data-id");
    const vehicle = state.vehicles.find((item) => item.id === vehicleId);

    if (!vehicle) return;

    if (action === "edit") {
      openVehicleModal(vehicle);
    }

    if (action === "delete") {
      openDeleteModal(vehicle);
    }
  });
}

// Show the app immediately and attempt Firestore load. Auth is optional for unauthenticated rules.
showAuthView(true);

if (auth && auth.onAuthStateChanged) {
  auth.onAuthStateChanged((user) => {
    state.user = user;
    userBadge.textContent = user ? user.phoneNumber || "User" : "";
  });
}

loadVehicles();

document.addEventListener("DOMContentLoaded", bindEvents);

// Debug helper to inspect Firebase state and try a live fetch
window.showFirebaseDebug = async function () {
  const info = {
    firebaseInitStatus: window.firebaseInitStatus || null,
    firebaseInitError: window.firebaseInitError ? (window.firebaseInitError.message || String(window.firebaseInitError)) : null,
    hasDb: !!window.firebaseDb,
    hasAuth: !!window.firebaseAuth
  };

  try {
    if (window.firebaseDb && typeof getVehicles === 'function') {
      const vehicles = await getVehicles();
      info.sampleVehicles = vehicles.slice(0,3);
    }
  } catch (err) {
    info.fetchError = err && err.message ? err.message : String(err);
  }

  alert(JSON.stringify(info, null, 2));
  console.log('Firebase debug', info);
}
