import { uniq, uniqueId } from "lodash";

export default (text) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'application/xml');
  const parseError = doc.querySelector('parserror');
  if (parseError) return new Error('Parse Error');
  const feedTitle = doc.querySelector('channel > title').textContent;
  const feedDescription = doc.querySelector('description').textContent;
  const items = doc.querySelectorAll('item');
  const posts = Array.from(items).map((post, index) => {
    const title = post.querySelector('title').textContent ?? '';
    const description = post.querySelector('description').textContent ?? '';
    const link = post.querySelector('link').textContent ?? '';
    return {
      id: uniqueId(`${link}_`),
      title,
      description,
      link,
    };
  });
  return {
    feed: {
      feedTitle,
      feedDescription,
    },
    posts,
  };
};
