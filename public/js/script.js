document.addEventListener("DOMContentLoaded", function () {
    // Mostrar y ocultar la ventana emergente
    const feedbackButtons = document.querySelectorAll(".feedback");
    const popupWindow = document.querySelector(".popup-window");
    const closePopupButton = document.querySelector(".close-popup");
  
    feedbackButtons.forEach((button) => {
      button.addEventListener("click", () => {
        popupWindow.style.display = "block";
      });
    });
  
    closePopupButton.addEventListener("click", () => {
      popupWindow.style.display = "none";
    });
  
    // Validación de formularios y envío
    function handleFormSubmit(form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
  
        const nameInput = form.querySelector("input[name='name']");
        const phoneInput = form.querySelector("input[name='phone']");
        const name = nameInput.value.trim();
        const phone = phoneInput.value.trim();
        const namePattern = /^[A-Za-z\s]+$/;
        const phonePattern = /^\+593\d{9}$/;
  
        // Validación de los datos
        if (!name || !namePattern.test(name)) {
          console.error("Nombre inválido. Solo se permiten letras y espacios.");
          nameInput.focus();
          return;
        }
  
        if (!phonePattern.test(phone)) {
          console.error("Número de teléfono inválido. Ejemplo: +593933543342");
          phoneInput.focus();
          return;
        }
  
        // Enviar los datos usando Fetch
        fetch("/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, phone }),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Error al enviar los datos");
            }
            return response.json();
          })
          .then((data) => {
            console.log("Formulario enviado con éxito:", data);
            form.reset(); // Limpiar el formulario
            popupWindow.style.display = "none";
          })
          .catch((error) => {
            console.error("Error al enviar los datos:", error);
          });
      });
    }
  
    // Manejar múltiples formularios
    const forms = document.querySelectorAll("form[data-validate]");
    forms.forEach((form) => handleFormSubmit(form));
  });
  