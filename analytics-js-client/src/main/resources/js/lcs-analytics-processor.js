;(function() {
	var analyticsKey;
	var isFunction;
	var pendingFlush;
	var requestId;
	var requestInterval;
	var requestUri;
	var userId;
	var context = {};

	var LCSAnalyticsProcessor = Liferay.Analytics.integration('LCSAnalyticsProcessor').readyOnInitialize();

	LCSAnalyticsProcessor.prototype._ready = true;

	LCSAnalyticsProcessor.prototype.flush = function(callback) {
		var instance = this;

		var events = instance.getPendingEvents();

		for (var k in events) {
			var event = events[k];

			event.eventId = event.event;

			delete(event.event);

			var properties = event.properties;

			event.applicationId = properties.applicationId || 'Default';

			delete(properties.applicationId);

			event.properties = properties;

			delete(event.timestamp)

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
						context: context,
						events: events,
						protocolVersion: '1.0',
						userId: userId
					}
				),
				type: "POST",
				beforeSend: function(xhr) {
					xhr.setRequestHeader('Content-Type', 'application/json');
				},
				error: function(err) {
					console.error(err.responseText);
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

	LCSAnalyticsProcessor.prototype.getMetaTag = function(tagName) {
		var instance = this;

		var metaTag = document.querySelector("meta[name='" + tagName +"']");

		return metaTag ? metaTag.getAttribute("content") : '';
	};

	LCSAnalyticsProcessor.prototype.getPendingEvents = function() {
		var instance = this;

		var storedEvents = localStorage.getItem('lcs-analytics-events') || '[]';

		return JSON.parse(storedEvents);
	};

	LCSAnalyticsProcessor.prototype.initialize = function() {
		var instance = this;

		analyticsKey = instance.options.analyticsKey;
		isFunction = jqLiferayAnalytics.isFunction;
		requestInterval = instance.options.interval;
		requestUri = instance.options.uri;
		userId = 'id-' + Math.random().toString(36).substr(2, 16);

		instance.setContext()
	};

	LCSAnalyticsProcessor.prototype.setContext = function() {
		var instance = this;

		context['description'] = instance.getMetaTag('description');
		context['keywords'] = instance.getMetaTag('keywords');
		context['languageId'] = navigator.language;
		context['title'] = instance.getMetaTag('title');
		context['url'] = window.location.href;
		context['userAgent'] = navigator.userAgent;
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