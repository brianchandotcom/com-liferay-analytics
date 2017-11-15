import LCSClient from './LCSClient';

function getCachedQuery(query, attr) {
  let cache;
  return function() {
    if (!cache) {
      const tag = document.querySelector(query) || {};
      cache = tag[attr];
    }
    return cache;
  }
}

const getDescription = getCachedQuery('meta[name="description"]', 'content');
const getKeywords = getCachedQuery('meta[name="keywords"]', 'content');
const getTitle = getCachedQuery('title', 'innerHTML');

function defaultMiddleware(req, analytics) {
  req.context = {
    description: getDescription(),
    keywords: getKeywords(),
    languageId: navigator.language,
    title: getTitle(),
    url: location.href,
    userAgent: navigator.userAgent
    ...req.context
  };
  return req;
}

LCSClient.use(defaultMiddleware);
    