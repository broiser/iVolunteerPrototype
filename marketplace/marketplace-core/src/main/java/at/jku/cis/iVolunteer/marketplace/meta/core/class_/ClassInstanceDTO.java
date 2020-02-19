package at.jku.cis.iVolunteer.marketplace.meta.core.class_;

import java.util.Date;

import at.jku.cis.iVolunteer.model.meta.core.clazz.ClassArchetype;

public class ClassInstanceDTO {
	private String name;
	private String id;
	private String tenantId;
	private ClassArchetype classArchetype;
	private String issuerId;
	private String userId;
	private Date blockchainDate;
	private String imagePath;

	private String purpose;
	private Date dateFrom;
	private Date dateTo;
	private String location;
	private String description;
	private String duration;
	private String rank;
	private String taskType1;
	private String taskType2;
	private String taskType3;
	private String hash;

	// Temp flags for dashboard presentation
	private boolean published; // flag if published
	private boolean inUserRepository;// flag if in inbox or in repository of user
	private boolean inIssuerInbox; // flag if in inbox of issuer

	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}

	public String getImagePath() {
		return imagePath;
	}

	public void setImagePath(String imagePath) {
		this.imagePath = imagePath;
	}

	public boolean isPublished() {
		return published;
	}

	public void setPublished(boolean published) {
		this.published = published;
	}

	public boolean isInUserRepository() {
		return inUserRepository;
	}

	public void setInUserRepository(boolean inUserRepository) {
		this.inUserRepository = inUserRepository;
	}

	public boolean isInIssuerInbox() {
		return inIssuerInbox;
	}

	public void setInIssuerInbox(boolean inIssuerInbox) {
		this.inIssuerInbox = inIssuerInbox;
	}

	public ClassArchetype getClassArchetype() {
		return classArchetype;
	}

	public void setClassArchetype(ClassArchetype classArchetype) {
		this.classArchetype = classArchetype;
	}

	public String getIssuerId() {
		return issuerId;
	}

	public void setIssuerId(String issuerId) {
		this.issuerId = issuerId;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getHash() {
		return hash;
	}

	public void setHash(String hash) {
		this.hash = hash;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Date getBlockchainDate() {
		return blockchainDate;
	}

	public void setBlockchainDate(Date blockchainDate) {
		this.blockchainDate = blockchainDate;
	}

	public String getPurpose() {
		return purpose;
	}

	public void setPurpose(String purpose) {
		this.purpose = purpose;
	}

	public Date getDateFrom() {
		return dateFrom;
	}

	public void setDateFrom(Date dateFrom) {
		this.dateFrom = dateFrom;
	}

	public Date getDateTo() {
		return dateTo;
	}

	public void setDateTo(Date dateTo) {
		this.dateTo = dateTo;
	}

	public String getLocation() {
		return location;
	}

	public void setLocation(String location) {
		this.location = location;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getDuration() {
		return duration;
	}

	public void setDuration(String duration) {
		this.duration = duration;
	}

	public String getRank() {
		return rank;
	}

	public void setRank(String rank) {
		this.rank = rank;
	}

	public String getTaskType1() {
		return taskType1;
	}

	public void setTaskType1(String taskType1) {
		this.taskType1 = taskType1;
	}

	public String getTaskType2() {
		return taskType2;
	}

	public void setTaskType2(String taskType2) {
		this.taskType2 = taskType2;
	}

	public String getTaskType3() {
		return taskType3;
	}

	public void setTaskType3(String taskType3) {
		this.taskType3 = taskType3;
	}

	@Override
	public String toString() {
		return "ClassInstanceDTO [name=" + name + ", blockchainDate=" + blockchainDate + ", purpose=" + purpose
				+ ", dateFrom=" + dateFrom + ", dateTo=" + dateTo + ", location=" + location + ", description="
				+ description + ", duration=" + duration + ", rank=" + rank + ", taskType1=" + taskType1
				+ ", taskType2=" + taskType2 + ", taskType3=" + taskType3 + "]" + "\n";
	}

	public String getTenantId() {
		return tenantId;
	}

	public void setTenantId(String tenantId) {
		this.tenantId = tenantId;
	}

}
