package at.jku.cis.iVolunteer.model._httprequests;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import at.jku.cis.iVolunteer.model.task.XDynamicFieldBlock;
import at.jku.cis.iVolunteer.model.user.XGeoInfo;

public class PostTaskRequest {
	

	private String tenantId;
	private String title;
	private String description;
	private Date startDate;
	private Date endDate;
	private String image;
	private String imagePath;
	private Boolean closed;
	private XGeoInfo geoInfo;
	private List<XDynamicFieldBlock> dynamicFields = new ArrayList<>();
	private List<String> subscribedUsers = new ArrayList<>();
	private List<String> badges = new ArrayList<>();
	
	
	public String getTenantId() {
		return tenantId;
	}
	public void setTenantId(String tenantId) {
		this.tenantId = tenantId;
	}
	public String getTitle() {
		return title;
	}
	public void setTitle(String title) {
		this.title = title;
	}
	public String getDescription() {
		return description;
	}
	public void setDescription(String description) {
		this.description = description;
	}
	public Date getStartDate() {
		return startDate;
	}
	public void setStartDate(Date startDate) {
		this.startDate = startDate;
	}
	public Date getEndDate() {
		return endDate;
	}
	public void setEndDate(Date endDate) {
		this.endDate = endDate;
	}
	public String getImage() {
		return image;
	}
	public void setImage(String image) {
		this.image = image;
	}
	public Boolean isClosed() {
		return closed;
	}
	public void setClosed(Boolean closed) {
		this.closed = closed;
	}
	public XGeoInfo getGeoInfo() {
		return geoInfo;
	}
	public void setGeoInfo(XGeoInfo geoInfo) {
		this.geoInfo = geoInfo;
	}
	public List<XDynamicFieldBlock> getDynamicFields() {
		return dynamicFields;
	}
	public void setDynamicFields(List<XDynamicFieldBlock> dynamicFields) {
		this.dynamicFields = dynamicFields;
	}
	public List<String> getSubscribedUsers() {
		return subscribedUsers;
	}
	public void setSubscribedUsers(List<String> subscribedUsers) {
		this.subscribedUsers = subscribedUsers;
	}
	public List<String> getBadges() {
		return badges;
	}
	public void setBadges(List<String> badges) {
		this.badges = badges;
	}
	public String getImagePath() {
		return imagePath;
	}
	public void setImagePath(String imagePath) {
		this.imagePath = imagePath;
	}
	
	
	
	
	
}