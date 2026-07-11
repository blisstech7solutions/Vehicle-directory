const state = {
  user: null,
  vehicles: readStoredVehicles(),
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
  localStorage.setItem("nakshatraVehicles", JSON.stringify(vehicles));
}

function createLocalVehicleId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeText(value) {
  return (value || "").toString().toLowerCase().replace(/[^a-z0-9]/g, "");
}

const loginSection = document.getElementById("loginSection");
const appSection = document.getElementById("app");
const phoneForm = document.getElementById("phoneForm");
const otpForm = document.getElementById("otpForm");
const adminLoginBtn = document.getElementById("adminLoginBtn");
const loginPanel = document.getElementById("loginPanel");
const phoneNumberInput = document.getElementById("phoneNumber");
const otpCodeInput = document.getElementById("otpCode");
const authMessage = document.getElementById("authMessage");
const logoutBtn = document.getElementById("logoutBtn");
const userBadge = document.getElementById("userBadge");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const addVehicleBtn = document.getElementById("addVehicleBtn");
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
  logoutBtn.classList.toggle("hidden", !isLoggedIn);
}

function setMessage(element, message, isError = false) {
  element.textContent = message;
  element.style.color = isError ? "#e23d3d" : "#1353b0";
}

function clearForm() {
  vehicleForm.reset();
  vehicleIdField.value = "";
  state.editingVehicleId = null;
  formMessage.textContent = "";
}

function formatVehicleNumber(value) {
  return value.trim().replace(/\s+/g, " ");
}

function formatFlatNumber(value) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const sanitized = trimmed.replace(/[^a-z0-9]+/gi, "");
  if (!sanitized) return "";

  const digits = sanitized.match(/\d+/);
  const hasLetterE = /e/i.test(sanitized);

  if (hasLetterE || digits) {
    const numberPart = digits ? digits[0] : "";
    return numberPart ? `E-${numberPart}` : "E";
  }

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

  return state.vehicles.filter((vehicle) => normalizeText(vehicle.vehicleNumber).includes(query));
}

function renderVehicles() {
  const filtered = getFilteredVehicles();
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
          <div class="card-actions">
            <a class="primary-btn" href="tel:${vehicle.mobile || ""}">Call</a>
            ${canManage ? `<button class="secondary-btn" type="button" onclick="window.handleVehicleAction('${vehicle.id}', 'edit')">Edit</button>` : ""}
            ${canManage ? `<button class="danger-btn" type="button" onclick="window.handleVehicleAction('${vehicle.id}', 'delete')">Delete</button>` : ""}
          </div>
        </article>
      `;
    })
    .join("");
}

async function loadVehicles() {
  try {
    const vehicles = await getVehicles();
    state.vehicles = vehicles;
    persistStoredVehicles(vehicles);
    renderVehicles();
  } catch (error) {
    const storedVehicles = readStoredVehicles();
    state.vehicles = storedVehicles;
    if (storedVehicles.length) {
      setMessage(authMessage, "Firestore access is restricted. Showing locally saved data.");
    } else {
      setMessage(authMessage, "Firestore access is restricted. Add a vehicle to create local data.");
    }
    renderVehicles();
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
    if (state.editingVehicleId) {
      await updateVehicle(state.editingVehicleId, payload);
      setMessage(formMessage, "Vehicle updated successfully.");
    } else {
      await addVehicle(payload);
      setMessage(formMessage, "Vehicle added successfully.");
    }

    await loadVehicles();
    closeVehicleModal();
    setMessage(authMessage, state.editingVehicleId ? "Vehicle updated successfully." : "Vehicle added successfully.");
  } catch (error) {
    const fallbackVehicles = state.editingVehicleId
      ? state.vehicles.map((item) => (item.id === state.editingVehicleId ? { ...item, ...payload, id: state.editingVehicleId } : item))
      : [...state.vehicles, { id: createLocalVehicleId(), ...payload }];

    state.vehicles = fallbackVehicles;
    persistStoredVehicles(fallbackVehicles);
    renderVehicles();
    closeVehicleModal();
    setMessage(formMessage, "Saved locally because Firestore access is restricted.");
  }
}

async function handleDeleteConfirm() {
  if (!state.deletingVehicleId) return;

  try {
    await deleteVehicle(state.deletingVehicleId);
    await loadVehicles();
    closeDeleteModal();
  } catch (error) {
    const nextVehicles = state.vehicles.filter((item) => item.id !== state.deletingVehicleId);
    state.vehicles = nextVehicles;
    persistStoredVehicles(nextVehicles);
    renderVehicles();
    closeDeleteModal();
    setMessage(authMessage, "Deleted locally because Firestore access is restricted.");
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

async function handleLogout() {
  try {
    if (!auth) {
      setMessage(authMessage, "Firebase is not configured correctly.", true);
      return;
    }
    await logoutAdmin();
  } catch (error) {
    setMessage(authMessage, error.message || "Logout failed.", true);
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

function openWhatsAppMessage() {
  const message = generateParkingMessage();
  const encoded = encodeURIComponent(message);
  const ownerPhone = state.lastMatchedVehicle?.mobile;
  const targetUrl = ownerPhone ? `https://wa.me/${ownerPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
  window.open(targetUrl, "_blank", "noopener,noreferrer");
}

function bindEvents() {
  adminLoginBtn.addEventListener("click", () => {
    loginPanel.classList.toggle("hidden");
    authMessage.textContent = "";
  });
  phoneForm.addEventListener("submit", handleSendOtp);
  otpForm.addEventListener("submit", handleVerifyOtp);
  logoutBtn.addEventListener("click", handleLogout);
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
      if (!state.user) {
        setMessage(authMessage, "Only admin can edit vehicles.", true);
        return;
      }
      openVehicleModal(vehicle);
    }

    if (action === "delete") {
      if (!state.user) {
        setMessage(authMessage, "Only admin can delete vehicles.", true);
        return;
      }
      openDeleteModal(vehicle);
    }
  });
}

if (!auth || window.firebaseInitStatus === "error") {
  showAuthView(false);
  setMessage(authMessage, "Firebase configuration is invalid. Please update firebase-config.js with the correct project values from Firebase Console.", true);
} else {
  auth.onAuthStateChanged((user) => {
    state.user = user;
    if (user) {
      userBadge.textContent = user.phoneNumber || "User";
      showAuthView(true);
      loadVehicles();
    } else {
      userBadge.textContent = "";
      showAuthView(false);
      state.vehicles = readStoredVehicles();
      renderVehicles();
    }
  });
}

document.addEventListener("DOMContentLoaded", bindEvents);
