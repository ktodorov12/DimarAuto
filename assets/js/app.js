import carouselOnChange from "./events/carouselOnChange.js";
import formSubmit from "./events/formSubmit.js";
import mobileMenu from "./events/mobileMenu.js";

window.addEventListener("load", () => app());

function app() {
    carouselOnChange();
    formSubmit();
    mobileMenu();
}
