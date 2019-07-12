package at.jku.cis.iVolunteer.model.property.dto;

import java.util.List;

import at.jku.cis.iVolunteer.model.configurable.configurables.property.PropertyKind;
import at.jku.cis.iVolunteer.model.property.listEntry.dto.ListEntryDTO;
import at.jku.cis.iVolunteer.model.property.rule.dto.RuleDTO;

public class SinglePropertyDTO<T> {
	String id;
	String name;

	int order;
	
	List<RuleDTO> rules;
	
	List<ListEntryDTO<T>> legalValues;
	List<ListEntryDTO<T>> defaultValues;
	List<ListEntryDTO<T>> values;
	
	PropertyKind kind;
	
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

//	public T getValue() {
//		return value;
//	}
//	public void setValue(T value) {
//		this.value = value;
//	}
	
	public List<ListEntryDTO<T>> getValues() {
		return values;
	}
	public void setValues(List<ListEntryDTO<T>> values) {
		this.values = values;
	}
	

	public List<ListEntryDTO<T>> getDefaultValues() {
		return defaultValues;
	}
	public void setDefaultValues(List<ListEntryDTO<T>> defaultValues) {
		this.defaultValues = defaultValues;
	}
	
	public int getOrder() {
		return order;
	}
	
	public void setOrder(int order) {
		this.order = order;
	}

	public List<ListEntryDTO<T>> getLegalValues() {
		return legalValues;
	}
	public void setLegalValues(List<ListEntryDTO<T>> legalValues) {
		this.legalValues = legalValues;
	}

	
	public List<RuleDTO> getRules() {
		return rules;
	}
	public void setRules(List<RuleDTO> rules) {
		this.rules = rules;
	}

	public PropertyKind getKind() {
		return kind;
	}
	public void setKind(PropertyKind kind) {
		this.kind = kind;
	}
	
	@Override
	public boolean equals(Object obj) {
		if (!(obj instanceof SinglePropertyDTO<?>)) {
			return false;
		}
		return ((SinglePropertyDTO<?>) obj).id.equals(id);
	
	}
	@Override
	public int hashCode() {
		return this.id.hashCode();
	}
	
}
