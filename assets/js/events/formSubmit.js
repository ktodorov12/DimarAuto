import createNotification from "../util/createNotification.js";

export default function formSubmit(e) {
  const form = document.getElementById("contacts-form");

  if (!form) {
    return;
  }

  form.addEventListener("submit", onSubmit);
}

async function onSubmit(e) {
  e.preventDefault();

  const form = document.getElementById("contacts-form");

  const data = Object.fromEntries(["name", "email", "message"].map((id) => [id, document.getElementById(id)?.value.trim()]));

  const check = Object.values(data).some((v) => !v);

  const submitBtn = document.querySelector(".submit-button");
  submitBtn.disabled = true;
  form.disabled = true;

  try {
    if (check) {
      throw new Error("Моля, попълнете всички полета!");
    }

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
    form.disabled = false;
    submitBtn.disabled = false;
  }
}
