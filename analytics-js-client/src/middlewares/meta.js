import LCSClient from './LCSClient';

function getQuery(query, attr) {
  return function() {
    const tag = document.querySelector(query) || {};
    return tag[attr];
  }
}

const getDescription = getQuery('meta[name="description"]', 'content');
const getKeywords = getQuery('meta[name="keywords"]', 'content');
const getTitle = getQuery('title', 'innerHTML');

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
    