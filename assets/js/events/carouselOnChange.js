export default function carouselOnChange() {
  const featureCards = document.querySelectorAll(".feature-card");

  if (featureCards.length > 0) {
    featureCards.forEach((c) => c.addEventListener("click", changeCarouselFeature));
  }
}

function changeCarouselFeature(e) {
  e.preventDefault();

  const featureCard = e.currentTarget;

  if (featureCard.className.includes("active")) {
    return;
  }

  const content = featureCard.querySelector(".feature-content");
  const indicator = featureCard.querySelector(".feature-indicator");

  const title = content.querySelector(".feature-title");
  const description = content.querySelector(".feature-description");

  document.getElementById("feature-heading").textContent = title.textContent;
  document.getElementById("feature-text").textContent = description.textContent;

  document.querySelector(".feature-card.active").classList.remove("active");
  document.querySelector(".feature-indicator.active").classList.remove("active");
  
  featureCard.classList.add("active");
  indicator.classList.add("active");
}
