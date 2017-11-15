import schedule from 'schedule';
import storage from 'metal-storage';
import LCSClient from './LCSClient';

// activate Middlewares 
import './middlewares/default';
import './middlewares/meta';

const DEFAULT_FLUSH_TIME = 2000;
const REQUEST_TIMEOUT = 5000;
const STORAGE_KEY = 'lcs_client_batch';

/**
 * Serializes data and returns the result
 * @return {object}
 */
function serialize(eventId, applicationId, properties) {
	return { 
		eventId,
		applicationId,
		properties
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

class Analytics {

	/**
	 * Returns an Analytics instance and triggers the automatic flush loop
	 * @param {object} configuration object to instantiate the Analytics tool
	 */
	constructor(config) {
		this.config = config || {};
		this.events = storage.get(STORAGE_KEY) || [];

		// start automatic flush loop
		this.timer = schedule
			.every(`${DEFAULT_FLUSH_TIME}ms`)
			.do(() => this.flush());
	}

	/**
	 * Registers an event that is to be sent to the LCS endpoint
	 * @param {string} eventId - Id
	 * @param {string} applicationId - application 
	 * @param {object} eventProps - complementary informations
	 */
	send(eventId, applicationId, eventProps) {
		const args = [].slice.call(arguments);
		const data = serialize(...args);
		this.events.push(data);
		this.persist();
	}

	/**
	 * Resets the event queue
	 */
	reset() {
		this.events.splice(0, this.events.length);
		persist();
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
		// race condition against finishing off before the timeout is triggered
		return Promise.race([
			LCSClient.send(this),
			timeout(REQUEST_TIMEOUT)
		])
		// resets our storage if sending the events went down well
		.then(() => this.reset())
		// any type of error must be handled 
		.catch(handleError); 
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

}

export { Analytics };
export default Analytics;