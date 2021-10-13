import onChange from "on-change";

export default (state, elements, i18nInstance) => {
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
      // postLi.innerHTML = `
      //        <a href="${
      //          post.url
      //        }" class="fw-bold" data-id="2" target="_blank" rel="noopener noreferrer">${
      //   post.title
      // }</a>
      //        <button type="button" class="btn btn-outline-primary btn-sm" data-id="2" data-bs-toggle="modal" data-bs-target="#modal">${i18nInstance.t(
      //          "view"
      //        )}</button>
      //        `;
      postLi.innerHTML = `
             <a href="${post.url}" class="fw-bold" data-id="${post.id}" target="_blank" rel="noopener noreferrer">${post.title}</a>`;
      postsUl.append(postLi);
    });

    elements.posts.innerHTML = postsHeader;

    elements.posts.append(postsUl);
  };
  const resetMsg = () => {
    const p = document.getElementById("feedback");
    if (p) {
      p.remove();
    }
    elements.input.classList.remove("is-invalid");
  };
  const clearAndFocus = () => {
    elements.input.value = "";
    elements.input.focus();
  };
  const renderError = (errorMsg) => {
    resetMsg();
    elements.input.classList.add("is-invalid");
    const p = document.createElement("p");

    p.classList.add("position-absolute", "small", "text-danger");
    p.setAttribute("id", "feedback");
    p.textContent = errorMsg;
    elements.input.after(p);
  };
  const renderMsg = (msg) => {
    resetMsg();
    const p = document.createElement("p");
    p.classList.add("position-absolute", "small", "text-success");
    p.setAttribute("id", "feedback");
    p.textContent = msg;
    elements.input.after(p);
  };
  const goRenderSmth = (path, value) => {
    switch (path) {
      case "currentState":
        switch (state.currentState) {
          case "Filling":
            resetMsg();
            clearAndFocus();
            break;

          case "Retrieving":
            break;

          case "Parsing":
            break;

          case "Added":
            clearAndFocus();
            renderMsg(i18nInstance.t('loadSuccess'));
            break;

          case "Rendering":
            renderFeeds();
            renderPosts();
            break;

          case "Updating":
            resetMsg();
            break;
        }
        break;

      case "error": // state.error
        if (value === "") {
          resetMsg();
        } else {
          renderError(value);
        }
        break;
    }
  };
  return onChange(state, goRenderSmth);
};
