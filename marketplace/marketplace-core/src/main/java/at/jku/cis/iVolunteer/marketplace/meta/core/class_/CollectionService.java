package at.jku.cis.iVolunteer.marketplace.meta.core.class_;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedList;
import java.util.List;
import java.util.Stack;
import java.util.stream.Collectors;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import at.jku.cis.iVolunteer.marketplace._mapper.property.PropertyDefinitionToClassPropertyMapper;
import at.jku.cis.iVolunteer.marketplace.configurations.clazz.ClassConfigurationRepository;
import at.jku.cis.iVolunteer.marketplace.meta.core.property.definition.flatProperty.FlatPropertyDefinitionRepository;
import at.jku.cis.iVolunteer.marketplace.meta.core.relationship.RelationshipRepository;
import at.jku.cis.iVolunteer.model.configurations.clazz.ClassConfiguration;
import at.jku.cis.iVolunteer.model.matching.MatchingCollector;
import at.jku.cis.iVolunteer.model.matching.MatchingCollectorEntry;
import at.jku.cis.iVolunteer.model.meta.core.clazz.ClassDefinition;
import at.jku.cis.iVolunteer.model.meta.core.property.Tuple;
import at.jku.cis.iVolunteer.model.meta.core.property.definition.ClassProperty;
import at.jku.cis.iVolunteer.model.meta.core.property.definition.flatProperty.FlatPropertyDefinition;
import at.jku.cis.iVolunteer.model.meta.core.property.definition.flatProperty.FlatPropertyDefinitionTypes;
import at.jku.cis.iVolunteer.model.meta.core.property.definition.treeProperty.TreePropertyDefinition;
import at.jku.cis.iVolunteer.model.meta.core.property.definition.treeProperty.TreePropertyEntry;
import at.jku.cis.iVolunteer.model.meta.core.property.definition.treeProperty.TreePropertyRelationship;
import at.jku.cis.iVolunteer.model.meta.core.relationship.Association;
import at.jku.cis.iVolunteer.model.meta.core.relationship.AssociationCardinality;
import at.jku.cis.iVolunteer.model.meta.core.relationship.Relationship;
import at.jku.cis.iVolunteer.model.meta.core.relationship.RelationshipType;
//import at.jku.cis.iVolunteer.model.meta.form.EnumEntry;
import at.jku.cis.iVolunteer.model.meta.form.FormEntry;

@Service
public class CollectionService {

	public static final String PATH_DELIMITER = Character.toString((char) 28);

	@Autowired ClassConfigurationRepository classConfigurationRepository;
	@Autowired ClassDefinitionRepository classDefinitionRepository;
	@Autowired RelationshipRepository relationshipRepository;
	@Autowired FlatPropertyDefinitionRepository propertyDefinitionRepository;
	@Autowired PropertyDefinitionToClassPropertyMapper propertyDefinitionToClassPropertyMapper;

	public List<ClassDefinition> collectAllClassDefinitionsWithPropertiesAsList(String slotId) {
		ClassConfiguration configurator = classConfigurationRepository.findOne(slotId);
		if (configurator == null) {
			return null;
		}
		List<ClassDefinition> collectors = new ArrayList<ClassDefinition>();
		classDefinitionRepository.findAll(configurator.getClassDefinitionIds()).forEach(c -> {
			if (c.isCollector()) {
				collectors.add(c);
			}
		});

		for (ClassDefinition collector : collectors) {
			collector.setProperties(aggregateAllPropertiesDFS(collector, 0, collector.getProperties()));
		}
		return collectors;
	}

	public List<MatchingCollector> collectAllClassDefinitionsWithPropertiesAsMatchingCollectors(
			String classConfigurationId) {
		ClassConfiguration classConfiguration = classConfigurationRepository.findOne(classConfigurationId);

		if (classConfiguration == null) {
			return null;
		}

		List<MatchingCollector> collections = new ArrayList<>();
		classDefinitionRepository.findAll(classConfiguration.getClassDefinitionIds()).forEach(c -> {
			if (c.isCollector()) {
				MatchingCollector collection = new MatchingCollector();
				collection.setClassDefinition(c);
				collection.setNumberOfProperties(c.getProperties().size());
				collection.setPathDelimiter(PATH_DELIMITER);
				collections.add(collection);
			}
		});

		for (MatchingCollector collection : collections) {
			collection.setPath(getPathFromRoot(collection.getClassDefinition()));
			collection.setCollectorEntries(this.aggregateAllClassDefinitionsWithPropertiesDFS(
					collection.getClassDefinition(), 0, new ArrayList<>(), collection.getPath()));

			for (MatchingCollectorEntry entry : collection.getCollectorEntries()) {
				collection.setNumberOfProperties(
						collection.getNumberOfProperties() + entry.getClassDefinition().getProperties().size());
			}
			collection.setNumberOfDefinitions(collection.getCollectorEntries().size());
		}
		return collections;
	}

	private String getPathFromRoot(ClassDefinition classDefinition) {
		ArrayList<String> pathArray = new ArrayList<>();
		pathArray.add(classDefinition.getId());

		while (!classDefinition.isRoot()) {
			List<Relationship> relationships = this.relationshipRepository.findByTarget(classDefinition.getId());

			relationships = relationships.stream()
					.filter(r -> r.getRelationshipType().equals(RelationshipType.ASSOCIATION)
							| r.getRelationshipType().equals(RelationshipType.INHERITANCE))
					.collect(Collectors.toList());

			if (relationships.size() >= 1) {
				classDefinition = classDefinitionRepository.findOne(relationships.get(0).getSource());
				pathArray.add(PATH_DELIMITER);
				pathArray.add(classDefinition.getId());
			}
		}
		Collections.reverse(pathArray);
		return String.join("", pathArray);
	}

	List<ClassProperty<Object>> aggregateAllPropertiesDFS(ClassDefinition root, int level,
			List<ClassProperty<Object>> list) {
		Stack<Relationship> stack = new Stack<Relationship>();
		List<Relationship> relationships = this.relationshipRepository.findBySourceAndRelationshipType(root.getId(),
				RelationshipType.INHERITANCE);
		Collections.reverse(relationships);
		stack.addAll(relationships);

		if (stack == null || stack.size() <= 0) {
			return list;
		}
		while (!stack.isEmpty()) {
			Relationship relationship = stack.pop();
			ClassDefinition classDefinition = classDefinitionRepository.findOne(relationship.getTarget());

			for (ClassProperty<Object> property : classDefinition.getProperties()) {
				if (!list.stream().filter(p -> p.getId().contentEquals(property.getId())).findFirst().isPresent()) {
					list.add(property);
				}
			}
			this.aggregateAllPropertiesDFS(classDefinition, level + 1, list);
		}
		return list;
	}

	List<MatchingCollectorEntry> aggregateAllClassDefinitionsWithPropertiesDFS(ClassDefinition root, int level,
			List<MatchingCollectorEntry> list, String path) {
		Stack<Relationship> stack = new Stack<Relationship>();
		List<Relationship> relationships = this.relationshipRepository.findBySource(root.getId());
		relationships = relationships.stream().filter(r -> r.getRelationshipType().equals(RelationshipType.ASSOCIATION)
				| r.getRelationshipType().equals(RelationshipType.INHERITANCE)).collect(Collectors.toList());

		Collections.reverse(relationships);
		stack.addAll(relationships);

		if (stack == null || stack.size() <= 0) {
			return list;
		}
		while (!stack.isEmpty()) {
			Relationship relationship = stack.pop();
			ClassDefinition classDefinition = classDefinitionRepository.findOne(relationship.getTarget());
			if (classDefinition.getProperties() != null && classDefinition.getProperties().size() > 0) {
				list.add(new MatchingCollectorEntry(classDefinition, path + PATH_DELIMITER + classDefinition.getId(),
						PATH_DELIMITER));
			}
			this.aggregateAllClassDefinitionsWithPropertiesDFS(classDefinition, level + 1, list,
					path + PATH_DELIMITER + classDefinition.getId());
		}
		return list;
	}

	public List<TreePropertyEntry> collectEnumEntries(TreePropertyDefinition enumDefinition) {
		return aggregateAllEnumEntriesDFS(enumDefinition.getId(), 0, new ArrayList<>(), enumDefinition);
	}

	private List<TreePropertyEntry> aggregateAllEnumEntriesDFS(String rootId, int level, List<TreePropertyEntry> list,
			TreePropertyDefinition enumDefinition) {
		Stack<TreePropertyRelationship> stack = new Stack<>();
		List<TreePropertyRelationship> relationships = enumDefinition.getRelationships().stream()
				.filter(r -> r.getSourceEnumEntryId().equals(rootId)).collect(Collectors.toList());

		Collections.reverse(relationships);
		stack.addAll(relationships);

		if (stack == null || stack.size() <= 0) {
			return list;
		}

		while (!stack.isEmpty()) {
			TreePropertyRelationship relationship = stack.pop();
			TreePropertyEntry enumEntry = enumDefinition.getEntries().stream()
					.filter(e -> e.getId().equals(relationship.getTargetEnumEntryId())).findFirst().get();
			enumEntry.setPosition(new int[level + 1]);
			enumEntry.setLevel(level);
			list.add(enumEntry);
			this.aggregateAllEnumEntriesDFS(enumEntry.getId(), level + 1, list, enumDefinition);
		}

		return list;
	}

	@SuppressWarnings({ "unchecked", "rawtypes" })
	public FormEntry aggregateFormEntry(ClassDefinition currentClassDefinition, FormEntry currentFormEntry,
			List<ClassDefinition> allClassDefinitions, List<Relationship> allRelationships, boolean directionUp) {

		// Next ClassDefinition
		if (currentFormEntry.getClassDefinitions() == null) {
			currentFormEntry.setClassDefinitions(new LinkedList<>());
		}
		currentFormEntry.getClassDefinitions().add(currentClassDefinition);

		// Collect Properties
		currentFormEntry.getClassProperties().addAll(0, currentClassDefinition.getProperties());

		// grab target-side Relationships
		List<Relationship> targetRelationships = allRelationships.stream()
				.filter(r -> r.getTarget().equals(currentClassDefinition.getId())).collect(Collectors.toList());
		// grab source-side Relationships
		List<Relationship> sourceRelationships = allRelationships.stream()
				.filter(r -> r.getSource().equals(currentClassDefinition.getId())).collect(Collectors.toList());

		Collections.reverse(targetRelationships);
		Collections.reverse(sourceRelationships);
		Stack<Relationship> targetStack = new Stack<Relationship>();
		Stack<Relationship> sourceStack = new Stack<Relationship>();
		targetStack.addAll(targetRelationships);
		sourceStack.addAll(sourceRelationships);
		List<FormEntry> subFormEntries = new ArrayList<>();

		boolean unableToContinuePropertySet = false;
		FlatPropertyDefinition unableToContinuePropertyDefinition = createUnableToContinueProperty();

		while (!targetStack.isEmpty()) {
			Relationship relationship = targetStack.pop();
			if (relationship.getRelationshipType().equals(RelationshipType.INHERITANCE)) {
				if (directionUp) {
					ClassDefinition classDefinition = allClassDefinitions.stream()
							.filter(d -> d.getId().equals(relationship.getSource())).findFirst().get();
					currentFormEntry = aggregateFormEntry(classDefinition, currentFormEntry, allClassDefinitions,
							allRelationships, true);
				}
			}
		}

		while (!sourceStack.isEmpty()) {
			Relationship relationship = sourceStack.pop();

			if (relationship.getRelationshipType().equals(RelationshipType.ASSOCIATION)) {
				ClassDefinition classDefinition = allClassDefinitions.stream()
						.filter(d -> d.getId().equals(relationship.getTarget())).findFirst().get();
				FormEntry subFormEntry = aggregateFormEntry(classDefinition, new FormEntry(classDefinition.getId()),
						allClassDefinitions, allRelationships, false);
				subFormEntry.setMultipleAllowed(
						((Association) relationship).getTargetCardinality() == AssociationCardinality.N);

				subFormEntries.add(subFormEntry);

			} else if (relationship.getRelationshipType().equals(RelationshipType.INHERITANCE)) {
				if (!directionUp) {
					if (!unableToContinuePropertySet) {

						ClassDefinition parentClassDefinition = allClassDefinitions.stream()
								.filter(cd -> cd.getId().equals(relationship.getSource())).findFirst().get();

						unableToContinuePropertyDefinition.getAllowedValues().add(new Tuple<String, String>(
								parentClassDefinition.getId(), parentClassDefinition.getName()));

						unableToContinuePropertySet = true;

					}
					ClassDefinition classDefinition = allClassDefinitions.stream()
							.filter(cd -> cd.getId().equals(relationship.getTarget())).findFirst().get();
					unableToContinuePropertyDefinition.getAllowedValues()
							.add(new Tuple<String, String>(classDefinition.getId(), classDefinition.getName()));
				}
			}
		}

		if (unableToContinuePropertySet) {
			currentFormEntry.setClassProperties(new ArrayList<>());
			currentFormEntry.getClassProperties()
					.add(propertyDefinitionToClassPropertyMapper.toTarget(unableToContinuePropertyDefinition));
		}

		if (currentFormEntry.getSubEntries() == null || currentFormEntry.getSubEntries().size() <= 0) {
			currentFormEntry.setSubEntries(subFormEntries);
		} else {
			currentFormEntry.getSubEntries().addAll(subFormEntries);
		}

		return currentFormEntry;

		// handle target Relationships
		// if next target-side Relationship: Aggregation - goto handle Aggregation
		// if next target-side Relationship: Inheritance:
		// display selection, exit
		// if no next target-side Relationship: exit

		// handle source Relationships
		// if next source-side Relationship: Inheritance - goto handle Inheritance
		// if no source-side Relationship next: exit

	}

	public FormEntry getFormEntryChunk(ClassDefinition currentClassDefinition, ClassDefinition choiceClassDefinition,
			List<ClassDefinition> allClassDefinitions, List<Relationship> allRelationships) {
		FormEntry entry = aggregateFormEntry(choiceClassDefinition, new FormEntry(choiceClassDefinition.getId()),
				allClassDefinitions, allRelationships, true);
		return entry;

	}

	private FlatPropertyDefinition<Tuple<String, String>> createUnableToContinueProperty() {
		FlatPropertyDefinition<Tuple<String, String>> propertyDefinition = new FlatPropertyDefinitionTypes.TuplePropertyDefinition<String, String>();
		propertyDefinition.setId(new ObjectId().toHexString() + "unableToContinue");
		propertyDefinition.setName("Bitte auswählen");
		propertyDefinition.setAllowedValues(new ArrayList<>());
		propertyDefinition.setRequired(true);
		return propertyDefinition;
	}
}
