export default function mobileMenu() {
  const menuLink = document.querySelectorAll("#nav > .mobile-menu > ul > li > a");

  menuLink.forEach((a) => {
    a.addEventListener("click", () => {
      const input = document.getElementById("menu-toggle");
      input.checked = false;
    });
  });
}
