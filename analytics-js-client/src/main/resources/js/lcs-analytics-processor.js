;(function() {
	var analyticsKey;
	var applicationId;
	var isFunction;
	var messageFormat;
	var pendingFlush;
	var requestId;
	var requestInterval;
	var requestUri;
	var userAgent;
	var context = {};

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
			jqLiferayAnalytics.ajax({
				url: requestUri,
				cache: false,
				data: JSON.stringify(
					{
						analyticsKey: analyticsKey,
						applicationId: applicationId,
						channel: 'web',
						context: context,
						events: events,
						messageFormat: messageFormat,
						protocolVersion: '1.0',
						userAgent: userAgent
					}
				),
				type: "POST",
				beforeSend: function(xhr) {
					xhr.setRequestHeader('Content-Type', 'application/json');
				},
				error: function(err) {
					console.error(err.type);
				},
				success: function() {
					if (isFunction(callback)) {
						callback();
					}
				}
	 		 });

			instance.store([]);

			requestId = clearInterval(requestId);
		}
		else {
			pendingFlush = true;
		}
	};

	LCSAnalyticsProcessor.prototype.getPendingEvents = function() {
		var instance = this;

		var storedEvents = localStorage.getItem('lcs-analytics-events') || '[]';

		return JSON.parse(storedEvents);
	};

	LCSAnalyticsProcessor.prototype.initialize = function() {
		var instance = this;

		analyticsKey = instance.options.analyticsKey;
		applicationId = instance.options.applicationId;
		context['languageId'] = navigator.language;
		context['url'] = window.location.href;
		isFunction = jqLiferayAnalytics.isFunction;
		messageFormat = instance.options.messageFormat;
		requestInterval = instance.options.interval;
		requestUri = instance.options.uri;
		userAgent = navigator.userAgent;
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