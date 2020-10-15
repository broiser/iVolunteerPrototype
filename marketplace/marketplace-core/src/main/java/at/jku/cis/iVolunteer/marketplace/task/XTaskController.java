package at.jku.cis.iVolunteer.marketplace.task;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import at.jku.cis.iVolunteer.marketplace.meta.core.class_.ClassInstanceController;
import at.jku.cis.iVolunteer.marketplace.meta.core.class_.ClassInstanceService;
import at.jku.cis.iVolunteer.marketplace.meta.core.class_.xnet.XTaskInstanceService;
import at.jku.cis.iVolunteer.marketplace.security.LoginService;
import at.jku.cis.iVolunteer.model._httpresponses.ErrorResponse;
import at.jku.cis.iVolunteer.model._mapper.xnet.XTaskInstanceToTaskMapper;
import at.jku.cis.iVolunteer.model.meta.core.clazz.ClassArchetype;
import at.jku.cis.iVolunteer.model.meta.core.clazz.ClassInstance;
import at.jku.cis.iVolunteer.model.meta.core.clazz.TaskInstance;
import at.jku.cis.iVolunteer.model.task.XTask;
import at.jku.cis.iVolunteer.model.user.User;
import at.jku.cis.iVolunteer.model.user.XUser;



//TODO xnet done - test
@RestController
@RequestMapping("/task")
public class XTaskController {

	@Autowired private ClassInstanceService classInstanceService;
	@Autowired private ClassInstanceController classInstanceController;
	@Autowired private LoginService loginService;
	@Autowired private XTaskInstanceToTaskMapper xTaskInstanceToTaskMapper;
	@Autowired private XTaskInstanceService xTaskInstanceService;
	
	
	//CREATE NEW OPENED TASK (Fields already copied from TASKTEMPLATE inside Task)
	//POST {marketplaceUrl}/task/new/
	//Req: { Task }
	//Res: 200 (OK), 500 (FAILED)
	@PostMapping("/new")
	private ResponseEntity<Object> createOpenedTask(@RequestBody XTask task) {
		if (task == null) {
			return ResponseEntity.badRequest().body(new ErrorResponse("Task must not be null"));
		}
		
		TaskInstance instance = xTaskInstanceToTaskMapper.toSource(task);
		instance.setStatus("OPEN");
		instance = xTaskInstanceService.addOrOverwriteTaskInstance(instance);
		
		return ResponseEntity.ok().build();
	}
	
	

	//CREATE NEW CLOSED TASK (Fields already copied from TASKTEMPLATE inside Task)
	//(Creates Task and also creates TaskCertificate & BadgeCertificate for every subscribedUser and Task is automatically closed)
	//POST {marketplaceUrl}/task/new/closed
	//Req: { Task }
	//Res: 200 (OK), 500 (FAILED)
	
	@PostMapping("/new/closed")
	private ResponseEntity<Object> createClosedTask(@RequestBody XTask task) {
		if (task == null) {
			return ResponseEntity.badRequest().body(new ErrorResponse("Task must not be null"));
		}
		
		
		TaskInstance taskInstance = xTaskInstanceToTaskMapper.toSource(task);
		taskInstance.setStatus("CLOSED");
		taskInstance = xTaskInstanceService.addOrOverwriteTaskInstance(taskInstance);
		
		if (task.getSubscribedUsers() != null) {
			List<ClassInstance> addedClassInstances = new ArrayList<>();
			for (XUser user : task.getSubscribedUsers()) {
				ClassInstance classInstance = new ClassInstance(taskInstance);
				
				classInstance.setUserId(user.getId());
				classInstance.setId(null);
				addedClassInstances.add(classInstance);
				//TODO BadgeCertificates ausstellen
			}
			
			addedClassInstances = classInstanceController.createNewClassInstances(addedClassInstances);
			
			return ResponseEntity.ok().build();
			
		} else {
			System.out.println("subscribedusers are null");
			return ResponseEntity.ok().build();
		}

	}
	

	//FINALIZE / CLOSE TASK
	//(Creates TaskCertificate & BadgeCertificate for every subscribedUser and Task gets closed)
	//GET {marketplaceUrl}/task/close/
	//Req: {}
	//Res: 200 (OK), 500 (FAILED)
	
	
	@GetMapping("{taskId}/close")
	private ResponseEntity<Object> finalizeTask(@RequestParam("taskId") String taskId) {
		TaskInstance taskInstance = xTaskInstanceService.getTaskInstance(taskId);
		if (taskInstance == null) {
			return ResponseEntity.badRequest().body("no Task with requested TaskID");
		}
		
		taskInstance.setStatus("CLOSED");
		xTaskInstanceService.addOrOverwriteTaskInstance(taskInstance);
		
		
		if (taskInstance.getSubscribedVolunteerIds() != null) {
			List<ClassInstance> addedClassInstances = new ArrayList<>();
			for (String id : taskInstance.getSubscribedVolunteerIds()) {
				ClassInstance classInstance = new ClassInstance(taskInstance);
				
				classInstance.setUserId(id);
				classInstance.setId(null);
				addedClassInstances.add(classInstance);
				//TODO BadgeCertificates ausstellen
			}
			
			addedClassInstances = classInstanceController.createNewClassInstances(addedClassInstances);
			
			return ResponseEntity.ok().build();
			
		} else {
			System.out.println("subscribedusers are null");
			return ResponseEntity.ok().build();
		}
		
	}
	
	
	
//	@GetMapping("/all")
//	public List<TaskInstance> getAllTaskInstances() {
//		List<ClassInstance> classInstances = classInstanceService.getAllClassInstances();
//		return classInstanceToTaskInstanceMapper.toTargets(classInstances);
//	}
//
//	@GetMapping("/tenant/{tenantId}/all")
//	public List<TaskInstance> getTaskClassInstancesByTenantId(@PathVariable String tenantId) {
//		List<ClassInstance> classInstances = classInstanceService.getClassInstanceByArchetype(ClassArchetype.TASK, tenantId);
//		return classInstanceToTaskInstanceMapper.toTargets(classInstances);
//	}
//
//	@GetMapping("/tenant/{tenantId}/subscribed")
//	public List<TaskInstance> getSubscribedTaskClassInstancesByTenantId(@PathVariable String tenantId) {
//		User user = loginService.getLoggedInUser();
//	
//		//TODO DEBUG TESTING
////		user = new User();
////		user.setId("5f71ca22e5ccdd629ee45d47");
//		//--------
//		if (user == null) {
//			return null;
//		}
//		List<ClassInstance> classInstances = classInstanceService.getClassInstanceByArcheTypeAndUserIdAndTenantIdAndSubscribed(ClassArchetype.TASK, user.getId(), tenantId, true);
//		return classInstanceToTaskInstanceMapper.toTargets(classInstances);
//	}
//	
//	@GetMapping("/tenant/{tenantId}/unsubscribed")
//	public List<TaskInstance> getUnsubscribedTaskClassInstancesByTenantId(@PathVariable String tenantId) {
//		User user = loginService.getLoggedInUser();
//	
//		//TODO DEBUG TESTING
////		user = new User();
////		user.setId("5f71ca22e5ccdd629ee45d47");
//		//--------
//		if (user == null) {
//			return null;
//		}
//		List<ClassInstance> classInstances = classInstanceService.getClassInstanceByArcheTypeAndUserIdAndTenantIdAndSubscribed(ClassArchetype.TASK, user.getId(), tenantId, false);
//		return classInstanceToTaskInstanceMapper.toTargets(classInstances);
//	}
//
//	@GetMapping("/subscribed")
//	public List<TaskInstance> getSubscribedTaskClassInstances() {
//		User user = loginService.getLoggedInUser();
//		
//		//TODO DEBUG TESTING
////		user = new User();
////		user.setId("5f71ca22e5ccdd629ee45d47");
//		//--------
//		if (user == null) {
//			return null;
//		}
//		List<ClassInstance> classInstances = classInstanceService.getClassInstanceByArcheTypeAndUserIdAndSubscribed(ClassArchetype.TASK, user.getId(), true);
//		return classInstanceToTaskInstanceMapper.toTargets(classInstances);
//	}
//	
//	@GetMapping("/unsubscribed")
//	public List<TaskInstance> getUnsubscribedTaskClassInstances() {
//		User user = loginService.getLoggedInUser();
//		
//		//TODO DEBUG TESTING
////		user = new User();
////		user.setId("5f71ca22e5ccdd629ee45d47");
//		//--------
//		if (user == null) {
//			return null;
//		}
//		List<ClassInstance> classInstances = classInstanceService.getClassInstanceByArcheTypeAndUserIdAndSubscribed(ClassArchetype.TASK, user.getId(), false);
//		return classInstanceToTaskInstanceMapper.toTargets(classInstances);
//	}
//
//	@GetMapping("/{taskId}")
//	public TaskInstance getTask(@PathVariable String taskId) {
//		ClassInstance classInstance = classInstanceService.getClassInstanceById(taskId);
//		return classInstanceToTaskInstanceMapper.toTarget(classInstance);
//	}
//	
//	@PutMapping("/{taskId}/subscribe")
//	 public ResponseEntity<Object> subscribeToTask(@PathVariable String taskId) {
//		if (taskId == null) {
//			return ResponseEntity.badRequest().body(new ErrorResponse("TaskId must not be null"));
//		}
//		ClassInstance classInstance = classInstanceService.getClassInstanceById(taskId);
//		if (classInstance == null) {
//			return ResponseEntity.badRequest().body(new ErrorResponse("No such task"));
//		}
//		
//		classInstance.setSubscribed(true);
//		classInstance = classInstanceService.saveClassInstance(classInstance);
//		return ResponseEntity.ok().build();
//	}
//	
//	@PutMapping("/{taskId}/unsubscribe")
//	 public ResponseEntity<Object> unsubscribeFromTask(@PathVariable String taskId) {
//		if (taskId == null) {
//			return ResponseEntity.badRequest().body(new ErrorResponse("TaskId must not be null"));
//		}
//		
//		ClassInstance classInstance = classInstanceService.getClassInstanceById(taskId);
//		if (classInstance == null) {
//			return ResponseEntity.badRequest().body(new ErrorResponse("No such task"));
//		}
//		
//		classInstance.setSubscribed(false);
//		classInstance = classInstanceService.saveClassInstance(classInstance);
//		return ResponseEntity.ok().build();
//	}
//	
//	
//	@PostMapping("/new") 
//	public ResponseEntity<Object> createTask(@RequestBody TaskInstance task) {
//		if (task == null) {
//			return ResponseEntity.badRequest().body(new ErrorResponse("Task must not be null"));
//		}
//		
//		ClassInstance classInstance = classInstanceToTaskInstanceMapper.toSource(task);
//		classInstance = classInstanceService.saveClassInstance(classInstance);
//		
//		Map<String, Object> retMap = Collections.singletonMap("id", classInstance.getId());
//		return ResponseEntity.ok(retMap);
//	}
//
//	@PostMapping("/{taskId}/update")
//	public ResponseEntity<Object> updateTask(@PathVariable String taskId, @RequestBody TaskInstance task) {
//		if (task == null || taskId == null) {
//			return ResponseEntity.badRequest().body(new ErrorResponse("Task/TaskId must not be null"));
//		}
//		
//		task.getRequired().setId(taskId);
//		ClassInstance classInstance = classInstanceToTaskInstanceMapper.toSource(task);
//		classInstance = classInstanceService.saveClassInstance(classInstance);
//		return ResponseEntity.ok().build();
//
//	}
}