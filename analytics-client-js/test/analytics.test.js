const FLUSH_INTERVAL = 100;
const STORAGE_KEY = 'lcs_client_batch';

const Analytics = window.Analytics;
const assert = chai.assert;
const expect = chai.expect;
const fetchMock = window.fetchMock;

/**
 * Sends dummy events to test the Analytics API
 * @param {number} eventsNumber Number of events to send
 */
function sendDummyEvents(eventsNumber = 5) {
	for (let i = 0; i <= eventsNumber; i++) {
		const applicationId = 'test';
		const eventId = i;
		const properties = {
			a: 1,
			b: 2,
			c: 3,
		};

		Analytics.send(eventId, applicationId, properties);
	}
}

describe('Analytics API', () => {
	beforeEach(
		() => localStorage.removeItem(STORAGE_KEY)
	);

	it('Analytics is exposed to the global scope', () => {
		expect(Analytics).to.be.a('object');
	});

	it('Analytics can be instantiated throught "create" function', () => {
		Analytics.create.should.be.a('function');
	});

	it('Analytics.config must return the passed configuration object', () => {
		const config = {a: 1, b: 2, c: 3};

		Analytics.create(config);
		Analytics.config.should.deep.equal(config);
	});

	it('Analytics instance must expose send function', () => {
		Analytics.create();
		Analytics.send.should.be.a('function');
	});

	it('Analytics instance must expose registerPlugin function', () => {
		Analytics.create();
		Analytics.registerPlugin.should.be.a('function');
	});

	it('Analytics.registerPlugin must process the given plugin and execute its initialisation', function() {
		Analytics.create();

		const plugin = analytics => {
			analytics.should.be.equal(Analytics);
		};

		const spy = sinon.spy(plugin);

		Analytics.registerPlugin(spy);
		assert.isTrue(spy.calledOnce);
	});

	it('Analytics instance must expose registerMiddleware function', () => {
		Analytics.create();
		Analytics.registerMiddleware.should.be.a('function');
	});

	it('Analytics.send() must add the given event to the event queue', () => {
		const eventId = 'eventId';
		const applicationId = 'applicationId';
		const properties = {a: 1, b: 2, c: 3};

		Analytics.create();
		Analytics.send(eventId, applicationId, properties);

		const events = Analytics.events;

		events.should.have.lengthOf(1);

		events[0].should.deep.include({
			eventId,
			applicationId,
			properties,
		});
	});

	it('Analytics.send() must persist the given events to the LocalStorage', () => {
		const eventsNumber = 5;

		Analytics.create();

		sendDummyEvents(eventsNumber);

		const events = JSON.parse(localStorage.getItem(STORAGE_KEY));

		events.should.have.lengthOf.at.least(eventsNumber);
	});

	it('No overlapping requests are allowed', function(done) {
		let fetchCalled = 0;

		fetchMock.mock(
			'*',
			function() {
				fetchCalled += 1;

				return new Promise(
					resolve => {
						setTimeout(resolve, 10000);
					}
				);
			}
		);

		Analytics.create(
			{
				flushInterval: FLUSH_INTERVAL,
			}
		);

		sendDummyEvents();

		const spy = sinon.spy(Analytics, 'flush');

		setTimeout(
			() => {
				// Flush must be called 3 times

				assert.isTrue(spy.calledThrice);

				// Without sending another Fetch Request

				expect(fetchCalled).to.equal(1);

				Analytics.flush.restore();

				fetchMock.restore();

				done();
			},
			FLUSH_INTERVAL * 3.9
		);
	});

	it('Analytics.registerMiddleware must process the given middleware', function() {
		Analytics.create();

		const middleware = (req, analytics) => {
			analytics.should.be.equal(Analytics);
			req.should.be.a('object');

			return req;
		};

		const spy = sinon.spy(middleware);

		Analytics.registerMiddleware(spy);

		sendDummyEvents();

		return Analytics.flush().then(
			() => {
				assert.isTrue(spy.calledOnce);
			}
		);
	});
});