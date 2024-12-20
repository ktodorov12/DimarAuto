export default function formSubmit(e) {
  const form = document.getElementById("contacts-form");

  if (!form) {
    return;
  }

  form.addEventListener("submit", onSubmit);
}

async function onSubmit(e) {
  e.preventDefault();

  const data = {
    name: document.getElementById("name")?.value.trim(),
    email: document.getElementById("email")?.value.trim(),
    message: document.getElementById("message")?.value.trim(),
  };

  const check = Object.values(data).some((v) => !v);

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
  } catch (error) {
    console.log("Error:", error.message);
  } finally {
    console.log("Message sent!");
  }
}
