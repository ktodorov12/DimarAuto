export default function createNotification(status) {
  const body = document.querySelector("body");

  let notification = document.createElement("div");
  notification.setAttribute("id", "alert");

  if (status == "success") {
    notification.innerHTML = `     
    <div class="alert-container-success"> 
        <div class="alert-content">
            <div class="alert-description">
                <div class="alert-header">"Успех"</div>
                <div class="alert-message">
                    Съобщението Ви бе изпратено успешно!
                </div>
            </div>
        </div>
    </div>`;
  } else if (status == "fail") {
    notification.innerHTML = `
    <div class="alert-container-fail"> 
        <div class="alert-content">
            <div class="alert-description">
                <div class="alert-header">"Грешка"</div>
                <div class="alert-message">
                    Възникна неочаквана грешка!
                    Моля, опитайте отново.
                </div>
            </div>
        </div>
    </div>`;
  }

  notification.addEventListener("click", removeNotification);
  const interval = setInterval(removeNotification, 3000);

  body.appendChild(notification);

  function removeNotification() {
    const notification = document.getElementById("alert");
    if (notification) {
      notification.remove();
    }

    clearInterval(interval);
  }
}
