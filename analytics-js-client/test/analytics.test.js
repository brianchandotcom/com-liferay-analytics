const should = chai.should;
const expect = chai.expect;
const Analytics = window.Analytics;
const STORAGE_KEY = 'lcs_client_batch';

describe('Analytics API', () => {
	beforeEach(() => localStorage.removeItem(STORAGE_KEY));

	it('Analytics is exposed to the global scope', () => {
		expect(Analytics).to.be.a('function');
	});

	it('Analytics can be instantiated', () => {
		const analytics = new Analytics();
		analytics.should.be.a('object');
	});

	it('Analytics instance must expose getConfig function', () => {
		const analytics = new Analytics();
		analytics.getConfig.should.be.a('function');
	});

	it('Analytics.getConfig() must return the passed configuration object', () => {
		const config = {
			a: 1,
			b: 2,
			c: 3,
		};
		const analytics = new Analytics(config);
		analytics.getConfig().should.deep.equal(config);
	});

	it('Analytics instance must expose getEvents function', () => {
		const analytics = new Analytics();
		analytics.getEvents.should.be.a('function');
	});

	it('Analytics instance must expose send function', () => {
		const analytics = new Analytics();
		analytics.send.should.be.a('function');
	});

	it('Analytics.send() must add the given event to the event queue', () => {
		const analytics = new Analytics();
		const eventId = 'eventId';
		const applicationId = 'applicationId';
		const properties = {a: 1, b: 2, c: 3};
		analytics.send(eventId, applicationId, properties);
		const events = analytics.getEvents();
		events.should.have.lengthOf(1);
		events.should.deep.include({
			eventId,
			applicationId,
			properties,
		});
	});

	it('Analytics.send() must persist the given events to the LocalStorage', () => {
		const analytics = new Analytics();
		const eventId = 'eventId';
		const applicationId = 'applicationId';
		const properties = {a: 1, b: 2, c: 3};

		const eventsNumber = 5;

		for (let i = eventsNumber - 1; i >= 0; i -= 1) {
			analytics.send(eventId, applicationId, properties);
		}

		const events = JSON.parse(localStorage.getItem(STORAGE_KEY));
		events.should.have.lengthOf(eventsNumber);
	});

	it('Analytics.flush() must send an HTTP Request to given LCS endpoint', () => {
		const analytics = new Analytics();
		const eventsNumber = 5;

		for (let i = eventsNumber - 1; i > 0; i -= 1) {
			const eventId = i;
			const applicationId = 'test';
			const properties = {a: 1, b: 2, c: 3};
			analytics.send(eventId, applicationId, properties);
		}

		return analytics.flush();
	});

	it('Automatic flush must send an HTTP Request to given LCS endpoint at regular intervals', () => {
		const analytics = new Analytics();
		const eventsNumber = 5;

		for (let i = eventsNumber - 1; i > 0; i -= 1) {
			const eventId = i;
			const applicationId = 'test';
			const properties = {a: 1, b: 2, c: 3};
			analytics.send(eventId, applicationId, properties);
		}

		return analytics.flush();
	});
});
