import { differenceBy, uniqueId } from 'lodash';
import load from './XMLloader.js';
import parse from './parser.js';

const updatePosts = (state) => {
  const updateProcess = () => {
    state.currentState = 'Updating';
    state.feeds.forEach((feed) => {
      load(feed.url).then((response) => {
        const parsedUpdatedFeed = parse(response, feed.url, feed.id);

        const oldPostsList = state.posts.filter((post) => post.feedId === feed.id);

        const newPostsInFeed = differenceBy(parsedUpdatedFeed.posts, oldPostsList, 'url');
        newPostsInFeed.forEach((item) => { item.id = uniqueId('feed'); });

        state.posts = [...state.posts, ...newPostsInFeed];
        state.currentState = 'Rendering';
      });
    });
    updatePosts(state);
  };
  setTimeout(updateProcess, 5000);
};
export default updatePosts;
