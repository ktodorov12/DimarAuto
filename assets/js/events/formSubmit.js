import createNotification from "../util/createNotification.js";

const body = document.querySelector("body");
const form = document.getElementById("contacts-form");
const submitButton = form.querySelector('button[type="submit"]');

const overlay = document.createElement("div");
const loader = document.createElement("div");

export default function formSubmit(e) {
  if (!form) {
    return;
  }

  form.addEventListener("submit", onSubmit);
}

async function onSubmit(e) {
  e.preventDefault();

  const data = Object.fromEntries(
    ["name", "email", "phone", "message"].map((id) => [
      id,
      document.getElementById(id)?.value.trim(),
    ])
  );
  const gdpr = document.getElementById("gdpr").checked;
  const check = Object.values(data).some((v) => !v);

  try {
    if (check) {
      throw new Error("Моля, попълнете всички полета!");
    }

    if (!gdpr) {
      throw new Error("Моля, приемете условията за поверителност!");
    }

    form.removeEventListener("submit", onSubmit);
    submitButton.disabled = true;

    overlay.classList.add("overlay");
    loader.classList.add("spinner");
    overlay.appendChild(loader);
    body.appendChild(overlay);

    const response = await fetch("https://web-vwy0.onrender.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("failed to send");
    }

    createNotification("success");
  } catch (error) {
    createNotification("fail", "Възникна неочаквана грешка! Моля, опитайте отново.");
  } finally {
    form.addEventListener("submit", onSubmit);
    submitButton.disabled = false;
    body.removeChild(overlay);
  }
}
