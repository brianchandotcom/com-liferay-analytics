import schedule from 'schedule';
import {
	Storage,
	StorageMechanism,
	LocalStorageMechanism,
} from 'metal-storage';
import LCSClient from './LCSClient';

import './middlewares/default';
import './middlewares/meta';

const ENV = window || global;

const DEFAULT_FLUSH_TIME = 2000;
const REQUEST_TIMEOUT = 5000;
const STORAGE_KEY = 'lcs_client_batch';

const storage = new Storage(new LocalStorageMechanism());

/**
 * Serializes data and returns the result
 * @return {object}
 */
function serialize(eventId, applicationId, properties) {
	return {
		eventId,
		applicationId,
		properties,
	};
}

/**
 * Returns a promise that times out after the given time limit is exceeded
 * @return {object} Promise
 */
function timeout(timeout) {
	return new Promise((resolve, reject) => setTimeout(reject, timeout));
}

/**
 * Function to handle broken paths
 * @param {object} err
 */
function handleError(err) {
	console.log(err);
}

/**
 * Analytics class that is desined to collect events that are captured
 * for later processing. It persists the events in the LocalStorage using the
 * metal-storage implementation and flushes it to the defined endpoint at
 * regular intervals.
 */
class Analytics {
	/**
	 * Returns an Analytics instance and triggers the automatic flush loop
	 * @param {object} configuration object to instantiate the Analytics tool
	 */
	constructor(config) {
		const flushTime = config.autoFlushFrequency || DEFAULT_FLUSH_TIME;

		this.config = config || {};
		this.events = storage.get(STORAGE_KEY) || [];
		this.flushIsInProgress = false;

		this.timer = schedule.every(`${flushTime}ms`).do(() => this.flush());
	}

	/**
	 * Registers an event that is to be sent to the LCS endpoint
	 * @param {string} eventId - Id
	 * @param {string} applicationId - application
	 * @param {object} eventProps - complementary informations
	 */
	send(eventId, applicationId, eventProps) {
		const data = serialize(eventId, applicationId, eventProps);
		this.events.push(data);
		this.persist();
	}

	/**
	 * Resets the event queue
	 */
	reset() {
		this.events.splice(0, this.events.length);
		this.persist();
	}

	/**
	 * Persists the event queue to the LocalStorage
	 */
	persist() {
		storage.set(STORAGE_KEY, this.events);
	}

	/**
	 * Sends the event queue to the LCS endpoint
	 * @returns {object} Promise
	 */
	flush() {
		if (this.flushIsInProgress) return;

		if (this.events.length === 0) return;

		this.flushIsInProgress = true;

		return (
			Promise.race([LCSClient.send(this), timeout(REQUEST_TIMEOUT)])
				.then(() => this.reset())
				.catch(handleError)
				.then(() => (this.flushIsInProgress = false))
		);
	}

	/**
	 * Returns the determined LCS endpoint
	 * @return {string}
	 */
	getEndpointURL() {
		return this.config.uri;
	}

	/**
	 * Returns the event queue
	 * @return {array}
	 */

	getEvents() {
		return this.events;
	}

	/**
	 * Returns the configuration object with which this instance was created
	 * @return {object}
	 */
	getConfig() {
		return this.config;
	}

};

let singleton;

/**
 * Creates a singleton instance of Analytics
 * @param {object} config - configuration object to create a singleton instance of Analytics
 * @return {object} singleton instance of Analytics
 * @example
 * 	Analytics.create({
 *			analyticsKey: 'MyAnalyticsKey',
 *			userId: 'id-s7uatimmxgo',
 *			autoFlushFrequency: 2000,
 *			uri: 'https://ec-dev.liferay.com:8095/api/analyticsgateway/send-analytics-events'
 *	});
 */
function create(config = {}) {
	if (!singleton) {
		singleton = new Analytics(config);
		singleton.create = create;
	}

	// @TODO Restart the timer if the Analytics.create is called more than one time
	// with various auto flush frequency times
	
	singleton.config = config;
	ENV.Analytics = singleton;
}

ENV.Analytics = {
	create,
};

export {create};
export default create;