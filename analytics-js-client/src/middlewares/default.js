import LCSClient from './LCSClient';

function defaultMiddleware(req, analytics) {
	const events = analytics.getEvents();
	const config = analytics.getConfig();
	const requestBody = {
		analyticsKey: config.analyticsKey,
		context: {},
		protocolVersion: '1.0',
		userId: config.userId,
		events
	}
	return requestBody; 	
}

LCSClient.use(defaultMiddleware);
