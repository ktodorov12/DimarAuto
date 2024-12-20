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

  const data = {
    name: document.getElementById("name")?.value.trim(),
    email: document.getElementById("email")?.value.trim(),
    message: document.getElementById("message")?.value.trim(),
  };

  const check = Object.values(data).some((v) => !v);

  const submitBtn = document.querySelector(".submit-button");
  submitBtn.disabled = true;
  form.disabled = true;

  try {
    if (check) {
      throw new Error("all fields required");
    }

    const response = await fetch("http://localhost:3000", {
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
    createNotification("fail");
  } finally {
    form.disabled = false;
    submitBtn.disabled = false;
  }
}
