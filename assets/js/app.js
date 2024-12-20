import carouselOnChange from "./events/carouselOnChange.js";
import formSubmit from "./events/formSubmit.js";

window.addEventListener("load", () => app());

function app() {
    carouselOnChange();
    formSubmit();
}
