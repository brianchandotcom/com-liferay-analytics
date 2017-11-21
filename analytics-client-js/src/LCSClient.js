require('es6-promise').polyfill();
require('isomorphic-fetch');

const LCS_ENDPOINT =
	'https://ec-dev.liferay.com:8095/api/analyticsgateway/send-analytics-events';
const middlewares = [];

/**
 * Returns a resolved or rejected promise as per the response status
 * @param {object} The Analytics instance from which the data is extracted
 * @return {object} Promise object representing the result of the operation
 */
function send(analytics) {
	const request = getLCSRequest(analytics);
	const url = analytics.getEndpointURL() || LCS_ENDPOINT;
	return fetch(LCS_ENDPOINT, request).then(validate);
}

/**
 * Returns a Request object with all data from the analytics instance
 * includin the batched event objects
 * @param {object} The Analytics instance from which the data is extracted
 * @return {object} Request
 */
function getLCSRequest(analytics) {
	const headers = new Headers();
	const body = JSON.stringify(getRequestBody(analytics));

	headers.append('Content-Type', 'application/json');

	return {
		method: 'POST',
		mode: 'cors',
		credentials: 'same-origin',
		cache: 'default',
		headers,
		body,
	};
}

/**
 * Returns the formatted version of the analytics data that complies to the
 * predefined request specification of the LCS endpoint
 * @param {object} The Analytics instance from which the data is extracted
 * @return {object} object literal
 */
function getRequestBody(analytics) {
	const requestBody = {};
	return middlewares.reduce(
		(request, middleware) => middleware(request, analytics),
		requestBody
	);
}

/**
 * returns the Response object or a rejected Promise based on the
 * HTTP Response Code of the Response object
 * @param {object} resp
 * @return {object} Promise
 */
function validate(resp) {
	if (resp.ok) {
		return resp;
	} else {
		return new Promise((resolve, reject) => reject(resp));
	}
}

/**
 * Adds middleware function to provide ability to transform the request
 * that is sent to LCS endpoint
 * @param {function} middleware function to alter request
 * @example
 * LCSClient.use((req, analytics) => {
 *   req.firstEvent = analytics.getEvents()[0];
 *   req.myMetaInfo = 'myMetaInfo';
 *   return req;
 * });
 */
function use(middleware) {
	middlewares.push(middleware);
}

// expose the API of the Client
const LCSClient = {
	use,
	send,
};

export {LCSClient};
export default LCSClient;