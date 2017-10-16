# Analytics Clients

## Java Client

## JS Client

Paste this code inside the HTML head:

```html
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script><script>jqLiferayAnalytics=jQuery.noConflict(true);</script><script src="https://js-liferayanalytics.wedeploy.io/js/analytics-all-min.js"></script><script type="text/javascript">Liferay.Analytics.initialize({'LCSAnalyticsProcessor':{analyticsKey: 'MyAnalyticsKey',applicationId: 'AT',messageFormat: 'AT',interval: '20000',uri: 'http://54.235.215.13:8095/api/analyticsgateway/send-analytics-events'}});Liferay.Analytics.track('view',{elementId: window.location.href});Liferay.Analytics.flush()</script>
```