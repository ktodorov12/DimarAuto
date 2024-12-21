export default function createVideoModal(source) {
  const body = document.querySelector("body");

  const dialog = document.createElement("dialog");
  dialog.setAttribute("class", "video-modal");

  console.log(source);
  
  dialog.innerHTML = `
    <div class="video-container">
      <button class="video-modal-close">X</button>
      <video controls>
        <source src="assets/videos/${source.toString()}" type="video/mp4" />
      </video>
    </div>`;

  body.appendChild(dialog);
}
