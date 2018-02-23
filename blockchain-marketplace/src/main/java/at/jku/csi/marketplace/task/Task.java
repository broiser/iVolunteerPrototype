package at.jku.csi.marketplace.task;

import java.util.Date;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import at.jku.csi.marketplace.participant.Employee;
import at.jku.csi.marketplace.task.type.TaskType;

@Document
public class Task {

	@Id
	private String id;
	private String name;
	private String description;

	private Date startDate;
	private Date endDate;
	@DBRef
	private TaskType type;
	@DBRef
	private Employee taskManager;
	private TaskStatus taskStatus;
	
	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
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

	public TaskType getType() {
		return type;
	}

	public void setType(TaskType type) {
		this.type = type;
	}

	public Employee getTaskManager() {
		return taskManager;
	}

	public void setTaskManager(Employee taskManager) {
		this.taskManager = taskManager;
	}

	public TaskStatus getTaskStatus() {
		return taskStatus;
	}

	public void setTaskStatus(TaskStatus taskStatus) {
		this.taskStatus = taskStatus;
	}

}
