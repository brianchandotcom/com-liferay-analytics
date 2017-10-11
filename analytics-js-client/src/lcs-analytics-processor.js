;(function() {
	var ioRequest;
	var isFunction;
	var pendingFlush;
	var requestId;
	var requestInterval;
	var requestUri
	var themeDisplayData = {};

	var LCSAnalyticsProcessor = Liferay.Analytics.integration('LCSAnalyticsProcessor').readyOnInitialize();

	LCSAnalyticsProcessor.prototype._ready = true;

	LCSAnalyticsProcessor.prototype.flush = function(callback) {
		var instance = this;

		var events = instance.getPendingEvents();

		for (var k in events) {
			var event = events[k];

			var properties = event.properties;

			properties.entityType = properties.className;

			if (!isNaN(properties.classPK)) {
				properties.entityId = Number(properties.classPK);
			}

			var referrers = properties.referrers;

			for (var j in referrers) {
				var referrer = referrers[j];
				var referrerClassPKs = [];

				referrer.referrerClassType = referrer.referrerClassName;

				if (!isNaN(referrer.referrerClassPKs)) {
					referrerClassPKs.push(Number(referrer.referrerClassPKs));
				}
				else {
					var referrerClassPKsStrings = referrer.referrerClassPKs.split(',')

					for (var p in referrerClassPKsStrings) {
						referrerClassPKs.push(Number(referrerClassPKsStrings[p]));
					}
				}

				referrer.referrerEntityIds = referrerClassPKs;

				delete(referrer.referrerClassName);
				delete(referrer.referrerClassPKs);

				referrers[j] = referrer;
			}

			properties.referrers = referrers;

			delete(properties.className);
			delete(properties.classPK);

			event.properties = properties;
			events[k] = event;
		}

		pendingFlush = false;

		if (events.length) {
			if (ioRequest) {
				ioRequest(
					requestUri,
					{
						cache: false,
						data: AUI().JSON.stringify(
							{
								analyticsKey: themeDisplay.getAnalyticsKey(),
								applicationId: 'AT',
								channel: 'web',
								context: themeDisplayData,
								events: events,
								messageFormat: 'AT'
							}
						),
						headers: {
							'Anonymous-User-Id': themeDisplay.getAnonymousUserId(),
							'Content-Type': 'application/json'
						},
						method: 'POST',
						on: {
							failure: function(err) {
								console.error(err.type);
							},
							success: function() {
								if (isFunction(callback)) {
									callback();
								}
							}
						}
					}
				);

				instance.store([]);

				requestId = clearInterval(requestId);
			}
			else {
				pendingFlush = true;
			}
		}
	};

	LCSAnalyticsProcessor.prototype.getPendingEvents = function() {
		var instance = this;

		var storedEvents = localStorage.getItem('lcs-analytics-events') || '[]';

		return JSON.parse(storedEvents);
	};

	LCSAnalyticsProcessor.prototype.initialize = function() {
		var instance = this;

		requestInterval = instance.options.interval;
		requestUri = instance.options.uri;

		AUI().use(
			'aui-io-request','cookie',
			function(A) {
				A.Object.each(
					themeDisplay,
					function(item, index) {
						if (A.Lang.isFunction(item)) {
							var indexName = /^(get|is)(.*)$/.exec(index)[2];

							indexName = indexName[0].toLowerCase() + indexName.slice(1);

							var value = themeDisplay[index]();

							if (indexName === "companyId") {
								indexName = "instanceId";
							}
							else if(indexName === "layoutURL") {
								indexName = "url";
							}

							if (!isNaN(value)) {
								themeDisplayData[indexName] = Number(value);
							}
							else if ((/^true|false$/i).test(value)) {
								themeDisplayData[indexName] = (/^true$/i).test(value);
							}
							else {
								themeDisplayData[indexName] = value;
							}
						}
					}
				);

				isFunction = A.Lang.isFunction;
				ioRequest = A.io.request;
			}
		);
	};

	LCSAnalyticsProcessor.prototype.store = function(events) {
		var instance = this;

		events = events || [];

		localStorage.setItem('lcs-analytics-events', JSON.stringify(events));
	};

	LCSAnalyticsProcessor.prototype.track = function(event, properties) {
		var instance = this;

		var events = instance.getPendingEvents();

		events.push(event.obj);

		instance.store(events);

		if (!requestId) {
			requestId = setTimeout(instance.flush.bind(instance), requestInterval);
		}
	};

	Liferay.Analytics.addIntegration(LCSAnalyticsProcessor);
})();