import LCSClient from '../LCSClient';

/**
 * Default middleware that generates the basic message to LCS
 * @param {object} req - request object to alter
 * @param {object} analytics - Analytics instance to extract behaviour informations from it
 * @return {object} the updated request object
 */
function defaultMiddleware(req, analytics) {
	const events = analytics.getEvents();
	const config = analytics.getConfig();
	const requestBody = {
		analyticsKey: config.analyticsKey,
		context: {},
		protocolVersion: '1.0',
		userId: config.userId,
		events,
	};
	return {
		...requestBody,
		...req,
	};
}

// registers the middleware
LCSClient.use(defaultMiddleware);
