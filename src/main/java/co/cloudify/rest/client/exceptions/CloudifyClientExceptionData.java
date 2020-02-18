package co.cloudify.rest.client.exceptions;

import java.io.IOException;
import java.io.InputStream;
import java.io.Serializable;
import java.nio.charset.StandardCharsets;

import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Response;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.json.JSONObject;

@XmlRootElement
public class CloudifyClientExceptionData implements Serializable {
	/**	Serialization UID. */
	private static final long serialVersionUID = 1L;
	
	@XmlElement
	private String message;
	@XmlElement(name = "error_code")
	private String errorCode;
	@XmlElement(name = "server_traceback")
	private String serverTraceback;
	
	public String getMessage() {
		return message;
	}
	
	public void setMessage(String message) {
		this.message = message;
	}
	
	public String getErrorCode() {
		return errorCode;
	}
	
	public void setErrorCode(String errorCode) {
		this.errorCode = errorCode;
	}
	
	public String getServerTraceback() {
		return serverTraceback;
	}
	
	public void setServerTraceback(String serverTraceback) {
		this.serverTraceback = serverTraceback;
	}
	
	public static CloudifyClientExceptionData fromCloudifyClientException(final CloudifyClientException ex) throws IOException {
		Throwable cause = ex.getCause();
		if (cause instanceof WebApplicationException) {
			return fromWebAppException((WebApplicationException) cause);
		}
		return null;
	}
	
	public static CloudifyClientExceptionData fromWebAppException(final WebApplicationException ex) throws IOException {
		CloudifyClientExceptionData exceptionData = null;
		Response response = ex.getResponse();
		if (response != null) {
			exceptionData = new CloudifyClientExceptionData();
			Object entity = response.getEntity();
			if (entity instanceof InputStream) {
				InputStream is = (InputStream) entity;
				String bodyAsString;
				try {
					bodyAsString = IOUtils.toString(is, StandardCharsets.UTF_8);
					JSONObject jsonObj = new JSONObject(bodyAsString);
					exceptionData.setMessage(jsonObj.optString("message", "<not provided>"));
					exceptionData.setErrorCode(jsonObj.optString("error_code", "<not provided>"));
					exceptionData.setServerTraceback(jsonObj.optString("server_traceback", "<not provided>"));
				} finally {
					is.close();
				}
			}
		}
		return exceptionData;
	}
	
	@Override
	public String toString() {
		return new ToStringBuilder(this)
				.append("message", message)
				.append("errorCode", errorCode)
				.append("serverTraceback", serverTraceback)
				.toString();
	}
}
