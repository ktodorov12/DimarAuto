import createVideoModal from "../util/createVideoModal.js";

export default function openVideoModal() {
  const openModalButton = document.querySelector(".cta-button");

  openModalButton.addEventListener("click", openVideo);
}

function openVideo() {
  const activeCard = document.querySelector(".feature-card.active");
  const source = activeCard.dataset.video;

  createVideoModal(source);

  const closeBtn = document.querySelector(".video-modal-close");
  const modal = document.querySelector(".video-modal");
  const video = document.querySelector(".video-modal video");

  video.play();

  closeBtn.addEventListener("click", () => {
    modal.remove();
  });

  modal.addEventListener("close", function onClose() {
    video.pause();
  });
}
