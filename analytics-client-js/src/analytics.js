import {LocalStorageMechanism, Storage} from 'metal-storage';

import LCSClient from './LCSClient/LCSClient';
import defaultPlugins from './plugins/defaults';

const ENV = window || global;
const FLUSH_INTERVAL = 2000;
const REQUEST_TIMEOUT = 5000;
const STORAGE_KEY = 'lcs_client_batch';

// Creates LocalStorage wrapper
const storage = new Storage(new LocalStorageMechanism());

let instance = null;

/**
 * Analytics class that is desined to collect events that are captured
 * for later processing. It persists the events in the LocalStorage using the
 * metal-storage implementation and flushes it to the defined endpoint at
 * regular intervals.
 */
class Analytics {
	/**
	 * Returns an Analytics instance and triggers the automatic flush loop
	 * @param {object} config object to instantiate the Analytics tool
	 */
	constructor(
		config = {
			flushInterval: FLUSH_INTERVAL,
		}
	) {
		if (!instance) {
			instance = this;
		}

		instance.client = new LCSClient(config.uri);
		instance.config = config;
		instance.events = storage.get(STORAGE_KEY) || [];
		instance.isFlushInProgress = false;

		// Initializes default plugins

		defaultPlugins.forEach(
			plugin => plugin(instance)
		);

		// Starts flush loop

		if (instance.flushInterval) {
			clearInterval(instance.flushInterval);
		}

		instance.flushInterval = setInterval(
			() => instance.flush(),
			config.flushInterval
		);

		return instance;
	}

	/**
	 * Persists the event queue to the LocalStorage
	 * @protected
	 */
	_persist() {
		storage.set(STORAGE_KEY, this.events);
	}

	/**
	 * Serializes data and returns the result appending a timestamp to the returned
	 * data as well
	 * @param {string} eventId The event Id
	 * @param {string} applicationId The application Id
	 * @param {object} properties Additional properties to serialize
	 * @protected
	 * @return {object}
	 */
	_serialize(eventId, applicationId, properties) {
		const eventDate = new Date().toISOString();

		return {
			eventId,
			eventDate,
			applicationId,
			properties,
		};
	}

	/**
	 * Returns a promise that times out after the given time limit is exceeded
	 * @param {number} timeout
	 * @return {object} Promise
	 */
	_timeout(timeout) {
		return new Promise(
			(resolve, reject) => setTimeout(reject, timeout)
		);
	}

	/**
	 * Flushes the event queue and sends it to the registered endpoint. If no data
	 * is pending or a flush is already in progress, the request will be ignored.
	 * @return {object} A Promise that resolves successfully when the data has been
	 * sent or no pending data was left to be sent
	 */
	flush() {
		let result;

		if (!this.isFlushInProgress && this.events.length) {
			this.isFlushInProgress = true;

			result = Promise.race(
				[this.client.send(this), this._timeout(REQUEST_TIMEOUT)]
			)
				.then(() => this.reset())
				.catch(console.error)
				.then(() => (this.isFlushInProgress = false));
		}
		else {
			result = Promise.resolve();
		}

		return result;
	}

	/**
	 * Resets the event queue
	 */
	reset() {
		this.events.length = 0;

		this._persist();
	}

	/**
	 * Registers an event that is to be sent to the LCS endpoint
	 * @param {string} eventId Id of the event
	 * @param {string} applicationId ID of the application that triggered the event
	 * @param {object} eventProps Complementary information about the event
	 */
	send(eventId, applicationId, eventProps) {
		this.events = [
			...this.events,
			this._serialize(eventId, applicationId, eventProps),
		];

		this._persist();
	}

	/**
	 * Registers the given plugin and executes its initialistion logic
	 * @param {Function} plugin An Analytics Plugin
	 */
	registerPlugin(plugin) {
		if (typeof plugin === 'function') {
			plugin(this);
		}
	}

	/**
	 * Registers the given middleware. This middleware will be later on called
	 * with the request object and this Analytics instance
	 * @param {Function} middleware A function that will be invoked on every request
	 * @example
	 * Analytics.registerMiddleware(
	 *   (request, analytics) => {
	 *     ...
	 *   }
	 * );
	 */
	registerMiddleware(middleware) {
		if (typeof middleware === 'function') {
			this.client.use(middleware);
		}
	}

	/**
	 * Creates a singleton instance of Analytics
	 * @param {object} config Configuration object
	 * @example
	 * Analytics.create(
	 *   {
	 *	   flushInterval: 2000,
	 *	   uri: 'https://ec-dev.liferay.com:8095/api/analyticsgateway/send-analytics-events'
	 *	   userId: 'id-s7uatimmxgo',
	 *     analyticsKey: 'MyAnalyticsKey',
	 *   }
	 * );
	 */
	static create(config = {}) {
		ENV.Analytics = new Analytics(config);
		ENV.Analytics.create = Analytics.create;
	}
}

// Exposes Analytics.create to the global scope
ENV.Analytics = {
	create: Analytics.create,
};

export {Analytics};
export default Analytics;