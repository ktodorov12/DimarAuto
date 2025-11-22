export default function scrollButton() {
  const buttonContainer = document.getElementById("floating-btn-container");
  const button = document.getElementById("floating-btn");
  const contactsSection = document.getElementById("contacts");

  if (!buttonContainer || !button || !contactsSection) return;

  const updateButtonState = () => {
    const scrollPosition = window.scrollY + window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const threshold = 50;

    if (documentHeight - scrollPosition < threshold) {
      button.textContent = "Начало";
      button.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      button.textContent = "Запазете час";
      button.onclick = () => contactsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  window.addEventListener("scroll", () => {
    updateButtonState();
  });

  updateButtonState();
}