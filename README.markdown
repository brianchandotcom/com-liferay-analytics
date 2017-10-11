# Analytics Clients

## Java Client

## JS Client

Paste this code inside HTML head:

```html
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
<script src="https://js-liferayanalytics.wedeploy.io/analytics.js"></script>
<script src="https://js-liferayanalytics.wedeploy.io/liferay-analytics-api.js"></script>
<script src="https://js-liferayanalytics.wedeploy.io/lcs-analytics-processor.js"></script>

<script type="text/javascript">
    Liferay.Analytics.initialize(
        {
            'LCSAnalyticsProcessor':
            {
                analyticsKey: 'MyAnalyticsKey',
                applicationId: 'AT',
                messageFormat: 'AT',
                interval: '20000',
                uri: 'http://54.235.215.13:8095/api/analyticsgateway/send-analytics-events'
            }
        }
    );

    Liferay.Analytics.track(
        'view',
        {
            elementId: window.location.href
        }
    );

    Liferay.Analytics.flush()
</script>
```