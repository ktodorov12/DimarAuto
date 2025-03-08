import carouselOnChange from "./events/carouselOnChange.js";
import formSubmit from "./events/formSubmit.js";
import galleryEvents from "./events/galleryEvents.js";
import openVideoModal from "./events/openVideoModal.js";
import mobileMenu from "./events/mobileMenu.js";

window.addEventListener("load", () => app());

function app() {
    carouselOnChange();
    formSubmit();
    openVideoModal();
    galleryEvents();
    mobileMenu();
}
