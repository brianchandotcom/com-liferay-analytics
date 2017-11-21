const should = chai.should;
const expect = chai.expect;
const assert = chai.assert;
const Analytics = window.Analytics;
const STORAGE_KEY = 'lcs_client_batch';
const fetchMock =  window.fetchMock;

function sendDummyEvents(eventsNumber = 5) {
	for (let i = eventsNumber - 1; i > 0; i -= 1) {
		const eventId = i;
		const applicationId = 'test';
		const properties = {a: 1, b: 2, c: 3};
		Analytics.send(eventId, applicationId, properties);
	};
}

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

		sendDummyEvents(eventsNumber);

		const events = JSON.parse(localStorage.getItem(STORAGE_KEY));
		events.should.have.lengthOf.at.least(eventsNumber);
	});

	it('Analytics.flush() must send an HTTP Request to given LCS endpoint', function() {
		this.timeout(10000);

		Analytics.create();
		sendDummyEvents();

		return Analytics.flush();
	});

	it('Automatic flush must send an HTTP Request to given LCS endpoint at regular intervals', function() {
		const AUTO_FLUSH_FREQUENCY = 2000;

		this.timeout(10000);

		Analytics.create({
			autoFlushFrequency: AUTO_FLUSH_FREQUENCY,
		});

		const spy = sinon.spy(Analytics, 'flush');

		sendDummyEvents();

		return new Promise(resolve => {
			setTimeout(() => {
				assert.isTrue(spy.calledOnce);
				Analytics.flush.restore();
				resolve();
			}, AUTO_FLUSH_FREQUENCY * 1.25);
		});
	});

	it('No overlapping requests are allowed', function() {

		const AUTO_FLUSH_FREQUENCY = 2000;
		let fetchCalled = 0;

		this.timeout(30000);

		fetchMock.mock('*', function() {
			fetchCalled += 1;
			return new Promise(resolve => {
				setTimeout(resolve, 10000);
			});
		});

		Analytics.create({
			autoFlushFrequency: AUTO_FLUSH_FREQUENCY
		});

		sendDummyEvents();

		const spy = sinon.spy(Analytics, 'flush');

		return new Promise(resolve => {

			// It waits 3 loop cycle to make sure there is no further
			// attempts to flush the storage since the first request has not yet
			// been processed

			setTimeout(() => {

				// Flush must be called 3 times

				assert.isTrue(spy.calledThrice);

				// Without sending another Fetch Request

				expect(fetchCalled).to.equal(1);

				Analytics.flush.restore();
				resolve();

			}, AUTO_FLUSH_FREQUENCY * 3);
		});
	});

});