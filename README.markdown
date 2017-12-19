# Analytics Clients

## Java Client

Dependencies:

```
provided group: "com.liferay", name: "com.liferay.analytics.api", version: "1.0.0-20171122.215509-1"
provided group: "com.liferay", name: "com.liferay.analytics.client.impl", version: "1.0.0-20171122.215523-1"
provided group: "com.liferay", name: "com.liferay.analytics.data.binding.impl", version: "1.0.0-20171122.215542-1"
```

Usage example:

```java
public void sendAnalytics(String applicationKey, String userId) throws Exception {
    AnalyticsEventsMessage.Builder analyticsEventsMessageBuilder =
        AnalyticsEventsMessage.builder(applicationKey, userId);

    analyticsEventsMessageBuilder.contextProperty("languageId", "en_US");
    analyticsEventsMessageBuilder.contextProperty("url", "http://www.liferay.com");

    AnalyticsEventsMessage.Event.Builder eventBuilder = AnalyticsEventsMessage.Event.builder("ApplicationId", "View");

    eventBuilder.property("elementId", "banner1");

    analyticsEventsMessageBuilder.event(eventBuilder.build());

    analyticsEventsMessageBuilder.protocolVersion("1.0");

    AnalyticsClientImpl _analyticsClientImpl = new AnalyticsClientImpl()

    _analyticsClientImpl.sendAnalytics(analyticsEventsMessageBuilder.build());
}
```

## OSGi Client

Dependencies:

```
provided group: "com.liferay", name: "com.liferay.analytics.api", version: "1.0.0-20171122.215509-1"
provided group: "com.liferay", name: "com.liferay.analytics.client.osgi", version: "1.0.0-20171122.215533-1"
provided group: "com.liferay", name: "com.liferay.analytics.data.binding.impl", version: "1.0.0-20171122.215542-1"
```

Usage example:

```java
public void sendAnalytics(String applicationKey, String userId) throws Exception {
    AnalyticsEventsMessage.Builder analyticsEventsMessageBuilder =
        AnalyticsEventsMessage.builder(applicationKey, userId);

    analyticsEventsMessageBuilder.contextProperty("languageId", "en_US");
    analyticsEventsMessageBuilder.contextProperty("url", "http://www.liferay.com");

    AnalyticsEventsMessage.Event.Builder eventBuilder = AnalyticsEventsMessage.Event.builder("ApplicationId", "View");

    eventBuilder.property("elementId", "banner1");

    analyticsEventsMessageBuilder.event(eventBuilder.build());

    analyticsEventsMessageBuilder.protocolVersion("1.0");

    _analyticsClient.sendAnalytics(analyticsEventsMessageBuilder.build());
}

@Reference
private static AnalyticsClient _analyticsClient;
```

## JS Client

Paste this code inside the HTML head:

```html
<script>
(function(u, c, a, m, o,l){o="script",l=document,a=l.createElement(o)
,m=l.getElementsByTagName(o)[0],a.async=1,a.src=u,a.onload=c,
m.parentNode.insertBefore(a,m)})('https://s3-eu-west-1.amazonaws.com/com-liferay-analytics/analytics-all-min.js', function(){

    Analytics.create({ analyticsKey: 'MyAnalyticsKey' });
    Analytics.send('view', 'Layout');
});
</script>
```

The identity of the user generating the events will be automatically determined by the Analytics Client and the Identify Service.
However, you can manually provide its identity by calling the `setIdentity` method of the Analytics object:

```html
    Analytics.create({ analyticsKey: 'MyAnalyticsKey' });
    Analytics.setIdentity({ email: 'foo@bar.com', name: 'Foo' });
```

You can track custom events by invoking the `send` method of the Analytics object. For example: 

```html
    element.addEventListener('click', function(evt) {
        Analytics.send('share', 'Blogs', { socialNetwork: 'twitter'});
    });
```

The first argument of the `send` method identifies the event (e.g. `share`) and the second identifies the application associated to it (e.g. `Blogs`). 
Through the third optional argument you can pass some extra information.