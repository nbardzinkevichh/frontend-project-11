export default (text) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'application/xml');
  const parseError = doc.querySelector('parserror');
  // network errors???
  if (parseError) {
    return new Error('Parse Error');
  }

  const feedTitle = doc.querySelector('channel > title').textContent;
  const feedDescription = doc.querySelector('channel > description').textContent;
  const posts = doc.querySelectorAll('item');
  const postsTitle = Array.from(posts).map((post) => post.querySelector('title').textContent);

  return {
    feed: {
      feedTitle,
      feedDescription,
    },
    posts: postsTitle,
  };

  // return [feed, postsTitle];
};
