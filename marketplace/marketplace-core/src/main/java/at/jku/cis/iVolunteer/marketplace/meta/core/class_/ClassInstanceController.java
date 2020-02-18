package at.jku.cis.iVolunteer.marketplace.meta.core.class_;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import at.jku.cis.iVolunteer.model.meta.core.clazz.ClassArchetype;
import at.jku.cis.iVolunteer.model.meta.core.clazz.ClassDefinition;
import at.jku.cis.iVolunteer.model.meta.core.clazz.ClassInstance;

@RestController
public class ClassInstanceController {

	@Autowired
	private ClassInstanceRepository classInstanceRepository;
	@Autowired
	private ClassDefinitionService classDefinitionService;
	@Autowired
	private ClassInstanceMapper classInstanceMapper;

	@PostMapping("/meta/core/class/instance/all/by-archetype/{archetype}/user/{userId}")
	private List<ClassInstanceDTO> getClassInstancesByArchetype(@PathVariable("archetype") ClassArchetype archeType,
			@PathVariable("userId") String userId, @RequestBody List<String> tenantIds) {
		List<ClassDefinition> classDefinitions = new ArrayList<>();
		List<ClassInstance> classInstances = new ArrayList<>();
		
		tenantIds.forEach(tenantId -> {
			classDefinitions.addAll(classDefinitionService.getClassDefinitionsByArchetype(archeType,
				tenantId));
			
			classDefinitions.forEach(cd -> {
				classInstances.addAll(classInstanceRepository.getByUserIdAndClassDefinitionId(userId, cd.getId(), tenantId));
			});
		});
		
		
		return classInstanceMapper.mapToDTO(classInstances);
	}

	@PostMapping("/meta/core/class/instance/in-user-inbox/{userId}")
	private List<ClassInstance> getClassInstanceInUserInbox(@PathVariable("userId") String userId,
			@RequestBody List<String> tenantIds) {
		List<ClassInstance> classInstances = new ArrayList<>();

		tenantIds.forEach(tenantId -> {
			classInstances.addAll(classInstanceRepository.getByUserIdAndInUserRepositoryAndInIssuerInbox(userId, false, false, tenantId));
		});
		
		return classInstances;
	}

	@PostMapping("/meta/core/class/instance/in-user-repository/{userId}")
	private List<ClassInstanceDTO> getClassInstanceInUserRepostory(@PathVariable("userId") String userId,
			@RequestBody List<String> tenantIds) {

		Set<ClassInstance> ret = new LinkedHashSet<>();
		tenantIds.forEach(tenantId -> {
			ret.addAll(classInstanceRepository.getByUserIdAndInUserRepositoryAndInIssuerInbox(userId, true, false,
					tenantId));
		});

		return classInstanceMapper.mapToDTO(new ArrayList<>(ret));
	}

	@GetMapping("/meta/core/class/instance/in-issuer-inbox/{issuerId}/tenant/{tenantId}")
	private List<ClassInstance> getClassInstanceInIssuerInbox(@PathVariable("issuerId") String issuerId,
			@PathVariable("tenantId") String tenantId) {
		List<ClassInstance> instances = classInstanceRepository
				.getByIssuerIdAndInIssuerInboxAndInUserRepository(issuerId, true, false, tenantId);
		return instances;
	}

	@PutMapping("/meta/core/class/instance/set-in-user-repository/{inUserRepository}")
	private List<ClassInstance> setClassInstancesInUserRepository(
			@PathVariable("inUserRepository") boolean inUserRepository, @RequestBody List<String> classInstanceIds) {
		List<ClassInstance> classInstances = new ArrayList<>();
		classInstanceRepository.findAll(classInstanceIds).forEach(classInstances::add);

		for (ClassInstance classInstance : classInstances) {
			classInstance.setInUserRepository(inUserRepository);
		}

		return classInstanceRepository.save(classInstances);
	}

	@PutMapping("/meta/core/class/instance/set-in-issuer-inbox/{inIssuerInbox}")
	private List<ClassInstanceDTO> setClassInstancesInIssuerInbox(@PathVariable("inIssuerInbox") boolean inIssuerInbox,
			@RequestBody List<String> classInstanceIds) {
		List<ClassInstance> classInstances = new ArrayList<>();
		classInstanceRepository.findAll(classInstanceIds).forEach(classInstances::add);

		for (ClassInstance classInstance : classInstances) {
			classInstance.setInIssuerInbox(inIssuerInbox);
			classInstance.setInUserRepository(false);
		}

		return classInstanceMapper.mapToDTO(classInstanceRepository.save(classInstances));
	}

	@PostMapping("/meta/core/class/instance/new")
	public List<ClassInstance> createNewClassInstances(@RequestBody List<ClassInstance> classInstances) {

		for (ClassInstance classInstance : classInstances) {
			classInstance.setInIssuerInbox(true);
			classInstance.setInUserRepository(false);
		}
		return classInstanceRepository.save(classInstances);

	}

}
