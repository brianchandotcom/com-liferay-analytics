# Analytics Clients

## Java Client

## JS Client

Paste this code inside the HTML head:

```html
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script><script>jqLiferayAnalytics=jQuery.noConflict(true);</script><script src="https://js-liferayanalytics.wedeploy.io/js/analytics-all-min.js"></script><script type="text/javascript">Liferay.Analytics.initialize({'LCSAnalyticsProcessor':{analyticsKey:'MyAnalyticsKey',interval:'20000',uri:'https://ec-dev.liferay.com:8095/api/analyticsgateway/send-analytics-events'}});Liferay.Analytics.track('view',{applicationId:'Layout',referrer:document.referrer});Liferay.Analytics.flush()</script>
```