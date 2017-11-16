import LCSClient from '../LCSClient';

/**
 * Generates a local helper function to fetch information from DOM elements
 * @param {string} query - query string
 * @param {string} attr - attribute to fetch
 * @return {string} value of the specified attribute
 */
function getQuery(query, attr) {
	return function() {
		const tag = document.querySelector(query) || {};
		return tag[attr] || '';
	};
}

// shorthand functions
const getDescription = getQuery('meta[name="description"]', 'content');
const getKeywords = getQuery('meta[name="keywords"]', 'content');
const getTitle = getQuery('title', 'innerHTML');

/**
 * middleware function that augments the request with context informations
 * @param {object} req - request object to alter
 * @param {object} analytics - Analytics instance to extract behaviour informations from it
 * @return {object} the updated request object
 */
function context(req) {
	req.context = {
		description: getDescription(),
		keywords: getKeywords(),
		languageId: navigator.language,
		title: getTitle(),
		url: location.href,
		userAgent: navigator.userAgent,
		...req.context,
	};
	return req;
}

// registers the middleware
LCSClient.use(context);
