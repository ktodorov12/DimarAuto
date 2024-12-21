import carouselOnChange from "./events/carouselOnChange.js";
import formSubmit from "./events/formSubmit.js";
import openVideoModal from "./events/openVideoModal.js";

window.addEventListener("load", () => app());

function app() {
    carouselOnChange();
    formSubmit();
    openVideoModal();
}
