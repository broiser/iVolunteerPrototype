package at.jku.cis.iVolunteer.model.rule.entities;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import at.jku.cis.iVolunteer.model.meta.core.clazz.ClassDefinition;
//import at.jku.cis.iVolunteer.model.rule.archive.SourceRuleEntryDTO;
//import at.jku.cis.iVolunteer.model.rule.archive.TargetRuleEntryDTO;
import at.jku.cis.iVolunteer.model.rule.Action;
import at.jku.cis.iVolunteer.model.rule.ClassAction;
import at.jku.cis.iVolunteer.model.rule.ClassCondition;
import at.jku.cis.iVolunteer.model.rule.Condition;
import at.jku.cis.iVolunteer.model.rule.GeneralCondition;

public class DerivationRuleDTO {

	private String id;
	private String tenantId;
	private String name;
	private String container;
	private String marketplaceId;
	private List<GeneralConditionDTO> generalConditions;
	private List<ClassConditionDTO> conditions;
	private List<ClassActionDTO> classActions;
	private Date timestamp;

	public DerivationRuleDTO() {
		generalConditions = new ArrayList<GeneralConditionDTO>();
		conditions = new ArrayList<ClassConditionDTO>();
		classActions = new ArrayList<ClassActionDTO>();
	}
	
	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getMarketplaceId() {
		return marketplaceId;
	}

	public void setMarketplaceId(String marketplaceId) {
		this.marketplaceId = marketplaceId;
	}

	public Date getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(Date timestamp) {
		this.timestamp = timestamp;
	}

	public String getContainer() {
		return container;
	}

	public void setContainer(String container) {
		this.container = container;
	}
	
	public List<GeneralConditionDTO> getGeneralConditions(){
		return generalConditions;
	}
	
	public void setGeneralConditions(List<GeneralConditionDTO> list) {
		this.generalConditions = list;
	}
	
	public void addGeneralCondition(GeneralConditionDTO generalCondition) {
		generalConditions.add(generalCondition);
	}
	
	public List<ClassConditionDTO> getConditions() {
		return conditions;
	}

	public void setConditions(List<ClassConditionDTO> conditions) {
		this.conditions = conditions;
	}
	
	public void addCondition(ClassConditionDTO condition) {
		conditions.add(condition);
	}
	
	public List<ClassActionDTO> getClassActions() {
		return classActions;
	}

	public void setActions(List<ClassActionDTO> actions) {
		this.classActions = actions;
	}
	
	public void addClassAction(ClassActionDTO action) {
		classActions.add(action);
	}
	
	public String getTenantId() {
		return tenantId;
	}

	public void setTenantId(String tenantId) {
		this.tenantId = tenantId;
	}

}
