import createNotification from "../util/createNotification.js";

const body = document.querySelector("body");
const form = document.getElementById("contacts-form");

export default function formSubmit() {
  if (!form) return;
  form.addEventListener("submit", onSubmit);
}

async function onSubmit(e) {
  e.preventDefault();

  const submitButton = form.querySelector('button[type="submit"]');

  const name = document.getElementById("name");
  const email = document.getElementById("email");
  const phone = document.getElementById("phone");
  const message = document.getElementById("message");

  const data = {
    name: name.value.trim(),
    email: email.value.trim(),
    phone: phone.value.trim(),
    message: message.value.trim(),
  };

  const gdprAccepted = document.getElementById("gdpr").checked;

  // ---- Client validation ----
  if (!Object.values(data).every((v) => v)) {
    return createNotification("fail", "Моля, попълнете всички полета!");
  }
  if (!gdprAccepted) {
    return createNotification("fail", "Моля, приемете условията за поверителност!");
  }

  // ---- Disable + show loader ----
  submitButton.disabled = true;

  const overlay = document.createElement("div");
  overlay.classList.add("overlay");

  const loader = document.createElement("div");
  loader.classList.add("spinner");

  overlay.appendChild(loader);
  body.appendChild(overlay);

  // ---- Kill pending requests after timeout ----
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch("https://web-vwy0.onrender.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    createNotification("success");
    form.reset();
  } catch (err) {
    console.error("Contact form error:", err);
    if (err.name === "AbortError") {
      createNotification("fail", "Времето за изпращане изтече. Моля, опитайте отново.");
    } else {
      createNotification("fail", "Възникна грешка! Моля, опитайте отново.");
    }
  } finally {
    clearTimeout(timeout);
    submitButton.disabled = false;

    // Safe overlay removal
    if (body.contains(overlay)) {
      body.removeChild(overlay);
    }
  }
}
