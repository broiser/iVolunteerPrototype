package at.jku.cis.iVolunteer.marketplace.meta.core.class_;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import at.jku.cis.iVolunteer.marketplace.commons.DateTimeService;
import at.jku.cis.iVolunteer.marketplace.hash.Hasher;
import at.jku.cis.iVolunteer.model.meta.core.clazz.ClassInstance;
import at.jku.cis.iVolunteer.model.meta.core.property.instance.PropertyInstance;

@Service
public class ClassInstanceMapper {

	@Autowired private Hasher hasher;
	@Autowired private DateTimeService dateTimeService;
	
	List<ClassInstanceDTO> mapToDTO(List<ClassInstance> classInstances) {
		List<ClassInstanceDTO> classInstanceDTOs = classInstances.stream().map(ci -> {
			ClassInstanceDTO dto = new ClassInstanceDTO();

			dto.setId(ci.getId());
			dto.setTenantId(ci.getTenantId());
			dto.setIssuerId(ci.getIssuerId());
			dto.setBlockchainDate(ci.getTimestamp());
			dto.setClassArchetype(ci.getClassArchetype());
			dto.setImagePath(ci.getImagePath());
			dto.setTimestamp(ci.getTimestamp());

//			dto.setPublished(ci.isPublished());
//			dto.setInUserRepository(ci.isInUserRepository());
//			dto.setInIssuerInbox(ci.isInIssuerInbox());
			dto.setHash(hasher.generateHash(ci));

			PropertyInstance<Object> name = ci.getProperties().stream().filter(p -> "name".equals(p.getName()))
					.findFirst().orElse(null);
			if (name != null) {
				if (name.getValues().size() > 0) {
					dto.setName((String) name.getValues().get(0));
				}
			}

			PropertyInstance<Object> purpose = ci.getProperties().stream().filter(p -> "purpose".equals(p.getName()))
					.findFirst().orElse(null);
			if (purpose != null) {
				if (purpose.getValues().size() > 0) {
					dto.setPurpose((String) purpose.getValues().get(0));
				}
			}

			PropertyInstance<Object> startingDate = ci.getProperties().stream()
					.filter(p -> "Starting Date".equals(p.getName())).findFirst().orElse(null);
			if (startingDate != null) {
				if (startingDate.getValues().size() > 0) {
					try {
						dto.setDateFrom((Date) startingDate.getValues().get(0));
					} catch (ClassCastException e) {
						Date parsedDate = this.dateTimeService.parseMultipleDateFormats((String)startingDate.getValues().get(0));
						dto.setDateFrom(parsedDate);
					}
				}
			}

			PropertyInstance<Object> endDate = ci.getProperties().stream().filter(p -> "End Date".equals(p.getName()))
					.findFirst().orElse(null);
			if (endDate != null) {
				if (endDate.getValues().size() > 0) {
					try {
					dto.setDateTo((Date) endDate.getValues().get(0));
					}catch(ClassCastException e) {
						Date parsedDate = this.dateTimeService.parseMultipleDateFormats((String)endDate.getValues().get(0));
						dto.setDateTo(parsedDate);
					}
				}
			}

			PropertyInstance<Object> duration = ci.getProperties().stream().filter(p -> "duration".equals(p.getName()))
					.findFirst().orElse(null);
			if (duration != null) {
				if (duration.getValues().size() > 0) {
					dto.setDuration((String) duration.getValues().get(0));
				}
			}

			PropertyInstance<Object> location = ci.getProperties().stream().filter(p -> "Location".equals(p.getName()))
					.findFirst().orElse(null);
			if (location != null) {
				if (location.getValues().size() > 0) {
					dto.setLocation((String) location.getValues().get(0));
				}
			}

			PropertyInstance<Object> description = ci.getProperties().stream()
					.filter(p -> "Description".equals(p.getName())).findFirst().orElse(null);
			if (description != null) {
				if (description.getValues().size() > 0) {
					dto.setDescription((String) description.getValues().get(0));
				}
			}

			PropertyInstance<Object> rank = ci.getProperties().stream().filter(p -> "rank".equals(p.getName()))
					.findFirst().orElse(null);
			if (rank != null) {
				if (rank.getValues().size() > 0) {
					dto.setRank((String) rank.getValues().get(0));
				}
			}

			PropertyInstance<Object> taskType1 = ci.getProperties().stream()
					.filter(p -> "taskType1".equals(p.getName())).findFirst().orElse(null);
			if (taskType1 != null) {
				if (taskType1.getValues().size() > 0) {
					dto.setTaskType1((String) taskType1.getValues().get(0));
				}
			}

			PropertyInstance<Object> taskType2 = ci.getProperties().stream()
					.filter(p -> "taskType2".equals(p.getName())).findFirst().orElse(null);
			if (taskType2 != null) {
				if (taskType2.getValues().size() > 0) {
					dto.setTaskType2((String) taskType2.getValues().get(0));
				}
			}

			PropertyInstance<Object> taskType3 = ci.getProperties().stream()
					.filter(p -> "taskType3".equals(p.getName())).findFirst().orElse(null);
			if (taskType3 != null) {
				if (taskType3.getValues().size() > 0) {
					dto.setTaskType3((String) taskType3.getValues().get(0));
				}
			}

			return dto;
		}).collect(Collectors.toList());

		return classInstanceDTOs;
	}

}
