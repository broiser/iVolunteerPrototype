package at.jku.cis.iVolunteer.marketplace.meta.core.class_;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import at.jku.cis.iVolunteer.marketplace._mapper.clazz.ClassDefinitionToInstanceMapper;
import at.jku.cis.iVolunteer.marketplace.commons.DateTimeService;
import at.jku.cis.iVolunteer.model.meta.core.clazz.ClassArchetype;
import at.jku.cis.iVolunteer.model.meta.core.clazz.ClassDefinition;
import at.jku.cis.iVolunteer.model.meta.core.clazz.ClassInstance;
import at.jku.cis.iVolunteer.model.meta.core.clazz.task.TaskClassInstance;
import at.jku.cis.iVolunteer.model.meta.core.property.PropertyType;

@RestController
public class ClassInstanceController {

	@Autowired
	private ClassInstanceRepository classInstanceRepository;
	@Autowired
	private ClassDefinitionService classDefinitionService;
	@Autowired
	private ClassInstanceMapper classInstanceMapper;
	@Autowired
	private ClassDefinitionToInstanceMapper classDefinitionToInstanceMapper;
	@Autowired
	private DateTimeService dateTimeService;

	@PostMapping("/meta/core/class/instance/all/by-archetype/{archetype}/user/{userId}")
	private List<ClassInstanceDTO> getClassInstancesByArchetype(@PathVariable("archetype") ClassArchetype archeType,
			@PathVariable("userId") String userId, @RequestBody List<String> tenantIds) {
		List<ClassInstance> classInstances = new ArrayList<>();

		tenantIds.forEach(tenantId -> {
			classInstances.addAll(
					classInstanceRepository.getByUserIdAndClassArchetypeAndTenantId(userId, archeType, tenantId));
		});

		return classInstanceMapper.mapToDTO(classInstances);
	}

	@GetMapping("/meta/core/class/instance/all")
	private List<ClassInstanceDTO> getAllClassInstances() {
		// TODO filter by tenant Id as header param
		return classInstanceMapper.mapToDTO(classInstanceRepository.findAll());
	}

	@GetMapping("/meta/core/class/instance/{id}")
	private ClassInstance getClassInstanceById(@PathVariable("id") String id) {
		return classInstanceRepository.findOne(id);
	}

	@PostMapping("/meta/core/class/instances")
	private List<ClassInstance> getClassInstanceById(@RequestBody List<String> classInstantIds) {
		List<ClassInstance> classInstances = new ArrayList<>();

		classInstantIds.forEach(id -> {
			classInstances.add(classInstanceRepository.findOne(id));
		});
		return classInstances;
	}

	@PostMapping("/meta/core/class/instanceDTOs")
	private List<ClassInstanceDTO> mapClassInstanceToDTO(@RequestBody List<ClassInstance> classInstances) {
		return classInstanceMapper.mapToDTO(classInstances);
	}

	@GetMapping("/meta/core/class/instance/all/by-archetype/{archetype}")
	private List<ClassInstance> getClassInstancesByArchetype(@PathVariable("archetype") ClassArchetype archeType,
			@RequestParam(value = "tId", required = true) String tenantId) {
		List<ClassInstance> classInstances = new ArrayList<>();
		List<ClassDefinition> classDefinitions = classDefinitionService.getClassDefinitionsByArchetype(archeType,
				tenantId);
		// TODO implement!!
		return classInstances;
	}

	// @PostMapping("/meta/core/class/instance/in-user-inbox/{userId}")
	// private List<ClassInstance>
	// getClassInstanceInUserInbox(@PathVariable("userId") String userId,
	// @RequestBody List<String> tenantIds) {
	// List<ClassInstance> classInstances = new ArrayList<>();
	//
	// tenantIds.forEach(tenantId -> {
	// classInstances.addAll(classInstanceRepository
	// .getByUserIdAndInUserRepositoryAndInIssuerInboxAndTenantId(userId, false,
	// false, tenantId));
	// });
	//
	// return classInstances;
	// }

	@PostMapping("/meta/core/class/instance/from-definition/{classDefinitionId}/user/{volunteerId}")
	public ClassInstance createClassInstanceByClassDefinitionId(@PathVariable String classDefinitionId,
			@RequestParam(value = "tId", required = true) String tenantId, @PathVariable String volunteerId,
			@RequestBody Map<String, String> properties) {

		ClassDefinition classDefinition = this.classDefinitionService.getClassDefinitionById(classDefinitionId,
				tenantId);

		if (classDefinition != null) {

			ClassInstance classInstance = this.classDefinitionToInstanceMapper.toTarget(classDefinition);

			classInstance.setUserId(volunteerId);
			classInstance.setTenantId(tenantId);
			classInstance.setIssuerId(tenantId);
			classInstance.setTimestamp(new Date());

			classInstance.getProperties().forEach(p -> {
				if (properties.containsKey(p.getName())) {
					if (p.getType() == PropertyType.DATE) {
						String dateAsString = properties.get(p.getName());
						Date date = dateTimeService.parseMultipleDateFormats(dateAsString);

						if (date != null) {
							p.setValues(Collections.singletonList(date));
						}
					} else {
						p.setValues(Collections.singletonList(properties.get(p.getName())));
					}
				}
			});
			return this.classInstanceRepository.save(classInstance);
		}

		return null;
	}

	// @PostMapping("/meta/core/class/instance/in-user-repository/{userId}")
	// private List<ClassInstanceDTO>
	// getClassInstanceInUserRepostory(@PathVariable("userId") String userId,
	// @RequestBody List<String> tenantIds) {
	//
	// Set<ClassInstance> ret = new LinkedHashSet<>();
	// tenantIds.forEach(tenantId -> {
	// ret.addAll(classInstanceRepository.getByUserIdAndInUserRepositoryAndInIssuerInboxAndTenantId(userId,
	// true,
	// false, tenantId));
	// });
	//
	// return classInstanceMapper.mapToDTO(new ArrayList<>(ret));
	// }
	//
	// @GetMapping("/meta/core/class/instance/in-issuer-inbox/{issuerId}")
	// private List<ClassInstance>
	// getClassInstanceInIssuerInbox(@PathVariable("issuerId") String issuerId,
	// @RequestParam(value="tId", required = true) String tenantId) {
	// List<ClassInstance> instances = classInstanceRepository
	// .getByIssuerIdAndInIssuerInboxAndInUserRepositoryAndTenantId(issuerId, true,
	// false, tenantId);
	// return instances;
	// }

	@PutMapping("/meta/core/class/instance/set-in-user-repository/{inUserRepository}")
	private List<ClassInstance> setClassInstancesInUserRepository(
			@PathVariable("inUserRepository") boolean inUserRepository, @RequestBody List<String> classInstanceIds) {
		List<ClassInstance> classInstances = new ArrayList<>();
		classInstanceRepository.findAll(classInstanceIds).forEach(classInstances::add);

		return classInstanceRepository.save(classInstances);
	}

	// @PutMapping("/meta/core/class/instance/set-in-issuer-inbox/{inIssuerInbox}")
	// private List<ClassInstanceDTO>
	// setClassInstancesInIssuerInbox(@PathVariable("inIssuerInbox") boolean
	// inIssuerInbox,
	// @RequestBody List<String> classInstanceIds) {
	// List<ClassInstance> classInstances = new ArrayList<>();
	// classInstanceRepository.findAll(classInstanceIds).forEach(classInstances::add);
	//
	// for (ClassInstance classInstance : classInstances) {
	// classInstance.setInIssuerInbox(inIssuerInbox);
	// classInstance.setInUserRepository(false);
	// }
	//
	// return
	// classInstanceMapper.mapToDTO(classInstanceRepository.save(classInstances));
	// return classInstanceRepository.save(classInstances);
	// }

	@PostMapping("/meta/core/class/instance/new")
	public List<ClassInstance> createNewClassInstances(@RequestBody List<ClassInstance> classInstances) {
		return classInstanceRepository.save(classInstances);
	}

	@PostMapping("/meta/core/class/taskInstance/new")
	public ClassInstance createNewTaskClassInstances(@RequestBody ClassInstance classInstance) {

		// TaskClassInstance tci = (TaskClassInstance) classInstance;
		return classInstanceRepository.save(classInstance);
	}

	@PostMapping("/meta/core/class/instance/newShared")
	public ClassInstance createNewSharedClassInstances(@RequestParam(value = "tId", required = true) String tenantId,
			@RequestBody String classInstanceId) {
		ClassInstance ci = classInstanceRepository.findOne(classInstanceId);

		TaskClassInstance ciNew = new TaskClassInstance();
		ciNew.setName(ci.getName());
		ciNew.setProperties(ci.getProperties());
		ciNew.setUserId(ci.getUserId());
		ciNew.setIssuerId(ci.getIssuerId());
		ciNew.setImagePath(ci.getImagePath());
		ciNew.setClassArchetype(ci.getClassArchetype());
		ciNew.setChildClassInstances(ci.getChildClassInstances());
		ciNew.setVisible(ci.isVisible());
		ciNew.setTabId(ci.getTabId());
		ciNew.setClassDefinitionId(ci.getClassDefinitionId());
		ciNew.setTimestamp(ci.getTimestamp());
		ciNew.setTenantId(tenantId);

		return this.classInstanceRepository.save(ciNew);
	}

	@DeleteMapping("/meta/core/class/instance/{id}/delete")
	private void deleteClassInstance(@PathVariable("id") String id) {
		this.classInstanceRepository.delete(id);

	}

}
