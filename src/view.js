import onChange from "on-change";

export default (state, elements) => {
  const resetForm = () => {
    const p = document.getElementById("errorMsg");
    if (p) {
      p.remove();
    }
    elements.input.classList.remove("is-invalid");
  };

  const renderError = (errorMsgPath) => {
    resetForm();
    elements.input.classList.add("is-invalid");
    const p = document.createElement("p");

    p.classList.add("position-absolute", "small", "text-danger");
    p.setAttribute("id", "errorMsg");
    p.textContent = errorMsgPath;
    elements.input.after(p);
  };

  return onChange(state, (path, value) => {
    console.log(path, value);

    switch (path) {
      case "currentState":
        switch (state.currentState) {
          case "Filling":
            resetForm();
            break;
        }
        break;

      case "isUrlValid":
        if (value === false) {
          renderError(state.errors.notValid);
        }
        break;

      case "isUrlUnique":
        if (value === false) {
          renderError(state.errors.notUniq);
        }
        break;
    }
  });
};
