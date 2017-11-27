# Analytics Clients

## Java Client

## JS Client

Paste this code inside the HTML head:

```html
(function(u, c, a, m, o,l){o="script",l=document,a=l.createElement(o)
,m=l.getElementsByTagName(o)[0],a.async=1,a.src=u,a.onload=c,
m.parentNode.insertBefore(a,m)})('https://js-liferayanalytics.wedeploy.io/js/analytics-all-min.js', function(){

    Analytics.create({ analyticsKey: 'MyAnalyticsKey', userId: 'id-test-js-client' });
    Analytics.send('view', 'Layout', { message: 'This is a test'});
});
```