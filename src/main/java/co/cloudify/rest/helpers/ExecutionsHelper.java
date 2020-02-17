package co.cloudify.rest.helpers;

import org.apache.commons.lang3.ObjectUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import co.cloudify.rest.client.CloudifyClient;
import co.cloudify.rest.client.ExecutionsClient;
import co.cloudify.rest.model.Execution;
import co.cloudify.rest.model.ExecutionStatus;

public class ExecutionsHelper {
	private static final Logger logger = LoggerFactory.getLogger(ExecutionsHelper.class);
	
	private static ExecutionFollowCallback DEFAULT_FOLLOW_CALLBACK = new DefaultExecutionFollowCallback();
	
	/**
	 * Follows an execution until it ends.
	 * 
	 * @param	client		Cloudify's REST client
	 * @param	execution	execution to track
	 * 
	 * @return	The most up-to-date representation of the execution.
	 */
	public static Execution followExecution(final CloudifyClient client, Execution execution,
			ExecutionFollowCallback callback) {
		ExecutionsClient executionsClient = client.getExecutionsClient();
		String executionId = execution.getId();
		ExecutionFollowCallback effectiveCallback = ObjectUtils.defaultIfNull(callback, DEFAULT_FOLLOW_CALLBACK);
		effectiveCallback.start(execution);
		while(true) {
			execution = executionsClient.get(executionId);
			effectiveCallback.callback(execution);
			if (ExecutionStatus.TERMINAL_STATUSES.contains(execution.getStatus())) {
				break;
			}
			try {
				Thread.sleep(2000);
			} catch (InterruptedException ex) {
				logger.warn("Asked to stop waiting; returning", ex);
				break;
			}
		}
		effectiveCallback.end(execution);
		return execution;
	}
}