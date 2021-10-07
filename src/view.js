import onChange from "on-change";

export default (state, elements) => {
  const resetError = () => {
    const p = document.getElementById("errorMsg");
    if (p) {
      p.remove();
    }
    elements.input.classList.remove("is-invalid");
  };

  const renderError = (errorMsg) => {
    resetError();
    elements.input.classList.add("is-invalid");
    const p = document.createElement("p");

    p.classList.add("position-absolute", "small", "text-danger");
    p.setAttribute("id", "errorMsg");
    p.textContent = errorMsg;
    elements.input.after(p);
  };

  return onChange(state, (path, value) => {
    switch (path) {
      case "currentState":
        switch (state.currentState) {
          case "Filling":
            resetError();
            break;
        }
        break;

      case "error":
        if (value === "") {
          resetError();
        } else {
          renderError(value);
        }
        break;
    }
  });
};
