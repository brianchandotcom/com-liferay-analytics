const should = chai.should;
const expect = chai.expect;
const Analytics = window.Analytics;
const STORAGE_KEY = 'lcs_client_batch';

describe('Analytics API', () => {
	beforeEach(() => localStorage.removeItem(STORAGE_KEY));

	it('Analytics is exposed to the global scope', () => {
		expect(Analytics).to.be.a('object');
	});

	it('Analytics can be instantiated throught "create" function', () => {
		Analytics.create.should.be.a('function');
	});

	it('Analytics instance must expose getConfig function', () => {
		Analytics.create();
		Analytics.getConfig.should.be.a('function');
	});

	it('Analytics.getConfig() must return the passed configuration object', () => {
		const config = {a: 1, b: 2, c: 3};
		Analytics.create(config);
		Analytics.getConfig().should.deep.equal(config);
	});

	it('Analytics instance must expose getEvents function', () => {
		Analytics.create();
		Analytics.getEvents.should.be.a('function');
	});

	it('Analytics instance must expose send function', () => {
		Analytics.create();
		Analytics.send.should.be.a('function');
	});

	it('Analytics.send() must add the given event to the event queue', () => {
		const eventId = 'eventId';
		const applicationId = 'applicationId';
		const properties = {a: 1, b: 2, c: 3};
		Analytics.create();
		Analytics.send(eventId, applicationId, properties);
		const events = Analytics.getEvents();
		events.should.have.lengthOf(1);
		events.should.deep.include({
			eventId,
			applicationId,
			properties,
		});
	});

	it('Analytics.send() must persist the given events to the LocalStorage', () => {
		const eventId = 'eventId';
		const applicationId = 'applicationId';
		const properties = {a: 1, b: 2, c: 3};

		const eventsNumber = 5;

		Analytics.create();

		for (let i = eventsNumber - 1; i >= 0; i -= 1) {
			Analytics.send(eventId, applicationId, properties);
		}

		const events = JSON.parse(localStorage.getItem(STORAGE_KEY));
		events.should.have.lengthOf.at.least(eventsNumber);
	});

	it('Analytics.flush() must send an HTTP Request to given LCS endpoint', () => {
		const eventsNumber = 5;

		Analytics.create();

		for (let i = eventsNumber - 1; i > 0; i -= 1) {
			const eventId = i;
			const applicationId = 'test';
			const properties = {a: 1, b: 2, c: 3};
			Analytics.send(eventId, applicationId, properties);
		}

		return Analytics.flush();
	});

	it('Automatic flush must send an HTTP Request to given LCS endpoint at regular intervals', () => {
		const AUTO_FLUSH_FREQUENCY = 1000;
		const eventsNumber = 5;

		Analytics.create({
			autoFlushFrequency: AUTO_FLUSH_FREQUENCY,
		});

		const spy = sinon.spy(Analytics, 'flush');

		for (let i = eventsNumber - 1; i > 0; i -= 1) {
			const eventId = i;
			const applicationId = 'test';
			const properties = {a: 1, b: 2, c: 3};
			Analytics.send(eventId, applicationId, properties);
		}

		return new Promise(resolve => {
			setTimeout(() => {
				assert(spy.calledOnce);
				resolve();
			}, AUTO_FLUSH_FREQUENCY * 1.25);
		});
	});
});
