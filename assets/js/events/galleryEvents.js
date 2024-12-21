export default function galleryEvents() {
  const images = document.querySelectorAll(".galery-item");

  images.forEach((i) => i.addEventListener("click", onClick));
  onFilterGallery(images);
  onClose();
}

function onFilterGallery(images) {
  const filterContainer = document.querySelector(".filter-container");

  filterContainer.addEventListener("click", (e) => {
    const tabFilter = e.target;
    if (tabFilter.tagName.toLowerCase() !== "p") {
      return;
    }

    const filter = tabFilter.getAttribute("data-filter");
    document.querySelector(".tab.tab-active").classList.remove("tab-active");
    tabFilter.classList.add("tab-active");

    images.forEach((item) => {
      if (filter === "all" || item.classList.contains(filter)) {
        item.classList.remove("hidden");
      } else {
        item.classList.add("hidden");
      }
    });
  });
}

function onClick(e) {
  const imgSrc = e.target.src;
  document.getElementById("overlay-img").src = imgSrc;
  document.getElementById("overlay").style.display = "flex";
}

function onClose() {
  const overlay = document.getElementById("overlay");
  overlay.addEventListener("click", () => {
    overlay.style.display = "none";
  });
}
