/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */

package com.liferay.analytics.client.osgi.internal;

import com.liferay.analytics.client.AnalyticsClient;
import com.liferay.analytics.data.binding.JSONObjectMapper;
import com.liferay.analytics.model.AnalyticsEventsMessage;
import com.liferay.petra.json.web.service.client.JSONWebServiceClient;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;

import java.util.Dictionary;
import java.util.Properties;

import org.osgi.service.component.ComponentFactory;
import org.osgi.service.component.ComponentInstance;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Eduardo Garcia
 */
@Component(immediate = true, service = AnalyticsClient.class)
public class AnalyticsClientImpl implements AnalyticsClient {

	@Activate
	public void activate() {
		final Properties properties = new Properties();

		properties.setProperty("hostName", _ANALYTICS_GATEWAY_HOST);
		properties.setProperty("hostPort", _ANALYTICS_GATEWAY_PORT);
		properties.setProperty("protocol", _ANALYTICS_GATEWAY_PROTOCOL);

		ComponentInstance componentInstance = _componentFactory.newInstance(
			(Dictionary)properties);

		componentInstance.getInstance();

		_jsonWebServiceClient =
			(JSONWebServiceClient)componentInstance.getInstance();
	}

	public String sendAnalytics(AnalyticsEventsMessage analyticsEventsMessage)
		throws Exception {

		String jsonAnalyticsEventsMessage = _jsonObjectMapper.map(
			analyticsEventsMessage);

		if (_log.isDebugEnabled()) {
			_log.debug(
				String.format(
					"Sending analytics message %s to destination %s//%s:%s/%s",
					jsonAnalyticsEventsMessage, _ANALYTICS_GATEWAY_PROTOCOL,
					_ANALYTICS_GATEWAY_HOST, _ANALYTICS_GATEWAY_PORT,
					_ANALYTICS_GATEWAY_PATH));
		}

		return _jsonWebServiceClient.doPostAsJSON(
			_ANALYTICS_GATEWAY_PATH, jsonAnalyticsEventsMessage);
	}

	@Reference(
		target = "(component.factory=JSONWebServiceClient)", unbind = "-"
	)
	protected void setComponentFactory(ComponentFactory componentFactory) {
		_componentFactory = componentFactory;
	}

	@Reference(unbind = "-")
	protected void setJSONObjectMapper(
		JSONObjectMapper<AnalyticsEventsMessage> jsonObjectMapper) {

		_jsonObjectMapper = jsonObjectMapper;
	}

	private static final String _ANALYTICS_GATEWAY_HOST = System.getProperty(
		"analytics.gateway.host", "ec-dev.liferay.com");

	private static final String _ANALYTICS_GATEWAY_PATH = System.getProperty(
		"analytics.gateway.path",
		"/api/analyticsgateway/send-analytics-events");

	private static final String _ANALYTICS_GATEWAY_PORT = System.getProperty(
		"analytics.gateway.port", "8095");

	private static final String _ANALYTICS_GATEWAY_PROTOCOL =
		System.getProperty("analytics.gateway.protocol", "https");

	private static final Log _log = LogFactoryUtil.getLog(
		AnalyticsClientImpl.class);

	private ComponentFactory _componentFactory;
	private JSONObjectMapper<AnalyticsEventsMessage> _jsonObjectMapper;
	private JSONWebServiceClient _jsonWebServiceClient;

}