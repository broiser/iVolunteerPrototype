package at.jku.cis.iVolunteer.marketplace.configurations.matching.relationships;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import at.jku.cis.iVolunteer.model.configurations.matching.MatchingOperatorRelationship;

@RestController
public class MatchingOperatorRelationshipController {

	@Autowired private MatchingOperatorRelationshipRepository matchingOperatorRelationshipRepository;

	@GetMapping("matching-operator-relationship/{matchingConfigurationId}")
	public List<MatchingOperatorRelationship> getMatchingOperatorRelationshipByMatchingConfiguration(
			@PathVariable String matchingConfigurationId) {
		return matchingOperatorRelationshipRepository.findByMatchingConfigurationId(matchingConfigurationId);
	}

	@PostMapping("matching-operator-relationship")
	public void saveMatchingOperatorRelationshipByMatchingConfiguration(
			@RequestBody List<MatchingOperatorRelationship> relationships) {
		this.matchingOperatorRelationshipRepository.save(relationships);
	}

}
