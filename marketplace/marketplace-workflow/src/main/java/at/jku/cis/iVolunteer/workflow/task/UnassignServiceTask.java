package at.jku.cis.iVolunteer.workflow.task;

import org.activiti.engine.delegate.DelegateExecution;
import org.activiti.engine.delegate.JavaDelegate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import at.jku.cis.iVolunteer.lib.rest.clients.ContractorRestClient;

@Component
public class UnassignServiceTask implements JavaDelegate {

	private static final String TASK_ID = "taskId";
	private static final String VOLUNTEER_ID = "volunteerId";

	@Autowired
	private ContractorRestClient contractorRestClient;

	@Override
	public void execute(DelegateExecution delegateExecution) {
		String taskId = delegateExecution.getVariable(TASK_ID, String.class);
		String token = delegateExecution.getVariable("accessToken", String.class);
		String volunteerId = delegateExecution.getVariable(VOLUNTEER_ID, String.class);
		System.out.println(this.getClass().getName() + "{taskId: " + taskId + ", volunteerId: " + volunteerId + "}");

		contractorRestClient.unassignTask(taskId, volunteerId, token);
	}
}