export default (xmlData, feedUrl, feedId) => {
  const parser = new DOMParser();
  const parsedXMLData = parser.parseFromString(xmlData, "text/xml");

  // handle parsing error:
  if (parsedXMLData.querySelector("parsererror") != null) {
    throw new Error('errors.notValidXml');
  
  } else {
    const feedTitle = parsedXMLData.querySelector("title");
    const feedDescr = parsedXMLData.querySelector("description");

    const resulObj = {
      feed: {
        title: feedTitle.textContent,
        description: feedDescr.textContent,
        url: feedUrl,
        id: feedId,
      },
      posts: [],
    };

    const posts = parsedXMLData.querySelectorAll("item");
    posts.forEach((post) => {
      const postTitle = post.querySelector("title");
      const postUrl = post.querySelector("link");
      const postDescription = post.querySelector("description");
      const postObj = {
        description: postDescription.textContent,
        title: postTitle.textContent,
        url: postUrl.textContent,
        feedId: feedId,
        visited: false,
      };
      resulObj.posts.push(postObj);
    });
    return resulObj;
  }
};
