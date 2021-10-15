import onChange from "on-change";
import { Modal } from "bootstrap";
//import "bootstrap/dist/js/bootstrap.js";

export default (state, elements, i18nInstance) => {
  const handleModal = () => {
    elements.modalTitle.textContent = state.modal.title;
    elements.modalDescription.textContent = state.modal.description;
    elements.modalCloseBtn.textContent = i18nInstance.t("close");

    //change link fontWeight to normal if visited
    const currentpostLink = document.getElementById(state.modal.postId);
    currentpostLink.classList.remove("fw-bold");
    currentpostLink.classList.add("fw-normal");

    let modal = new Modal(document.getElementById("modal"));
    modal.show();
  };
  const renderFeeds = () => {
    const feedsHeader = `
<div class="card border-0" id="feeds">
<div class="card-body"><h2 class="card-title h4">${i18nInstance.t(
      "feeds"
    )}</h2></div>
</div>`;

    const feedsUl = document.createElement("ul");
    feedsUl.classList.add("list-group", "border-0", "rounded-0");

    state.feeds.forEach((feed) => {
      const feedLi = document.createElement("li");
      feedLi.classList.add("list-group-item", "border-0", "border-end-0");
      feedLi.innerHTML = `
              <h3 class="h6 m-0">${feed.title}</h3>
              <p class="m-0 small text-black-50">${feed.description}</p>`;
      feedsUl.append(feedLi);
    });

    elements.feeds.innerHTML = feedsHeader;
    elements.feeds.append(feedsUl);
  };
  const renderPosts = () => {
    const postsHeader = `
<div class="card border-0">
<div class="card-body"><h2 class="card-title h4">${i18nInstance.t(
      "posts"
    )}</h2></div>
</div>`;

    const postsUl = document.createElement("ul");
    postsUl.classList.add("list-group", "border-0", "rounded-0");

    state.posts.forEach((post) => {
      const postLi = document.createElement("li");
      postLi.classList.add(
        "list-group-item",
        "d-flex",
        "justify-content-between",
        "align-items-start",
        "border-0",
        "border-end-0"
      );

      postLi.innerHTML = `
             <a href="${post.url}"  id="${
        post.id
      }" target="_blank" rel="noopener noreferrer">${post.title}</a>
            <button type="button" id="modalShowBtn" class="btn btn-outline-primary btn-sm" data-id="${
              post.id
            }"  data-bs-target="#modal">${i18nInstance.t("view")}</button>

`;
      const fontWeight = post.visited === false ? "fw-bold" : "fw-normal";
      const link = postLi.querySelector('a');
      link.classList.add(fontWeight);
      postsUl.append(postLi);
    });

    elements.posts.innerHTML = postsHeader;

    elements.posts.append(postsUl);
  };
  const clearFeedbackMsg = () => {
    elements.addBtn.disabled = false;
    elements.input.removeAttribute("readonly", "readonly");



    const p = document.getElementById("feedback");
    if (p) {
      p.remove();
    }
    elements.input.classList.remove("is-invalid");
  };
  const clearInputAndFocus = () => {
    elements.input.value = "";
    elements.input.focus();
  };
  const renderErrorFeedback = (errorMsg) => {
    clearFeedbackMsg();

    elements.input.classList.add("is-invalid");
    const p = document.createElement("p");

    p.classList.add("position-absolute", "small", "text-danger");
    p.setAttribute("id", "feedback");
    p.textContent = i18nInstance.t(errorMsg);
    elements.input.after(p);
  };
  const renderSuccessFeedback = (msg) => {
    const p = document.createElement("p");
    p.classList.add("position-absolute", "small", "text-success");
    p.setAttribute("id", "feedback");
    p.textContent = msg;
    elements.input.after(p);
  };

const hangleLoading = () => {
elements.input.setAttribute("readonly", "readonly");
elements.addBtn.disabled = true;
}

const handleAdded = () => {
  clearFeedbackMsg();
  elements.input.removeAttribute("readonly", "readonly");
  elements.addBtn.disabled = false;

  clearInputAndFocus();
  renderSuccessFeedback(i18nInstance.t("loadSuccess"));
}

const handleRendering = () => {
  renderFeeds();
  renderPosts();
}

  const goRenderSmth = (path, value) => {
    switch (path) {
      case "currentState":
        switch (state.currentState) {
          case "Filling":
            clearFeedbackMsg();
            clearInputAndFocus();
            break;

            case "Validating":
              clearFeedbackMsg();
              break;

          case "Loading":
            hangleLoading();
            break;

          case "Added":
            handleAdded();
            break;

          case "Rendering":
            handleRendering();
           
            break;

          case "Modal":
            handleModal();
            break;

            case "Updating":
              
              break;
         
        }
        break;

      case "error": // state.error
        clearFeedbackMsg();
        renderErrorFeedback(value);

        break;
    }
  };
  return onChange(state, goRenderSmth);
};
