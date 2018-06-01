package at.jku.cis.iVolunteer.trustifier.verification;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import at.jku.cis.iVolunteer.model.contract.CompetenceEntry;
import at.jku.cis.iVolunteer.model.contract.TaskEntry;
import at.jku.cis.iVolunteer.model.task.dto.TaskDTO;
import at.jku.cis.iVolunteer.trustifier.blockchain.BlockchainRestClient;
import at.jku.cis.iVolunteer.trustifier.hash.Hasher;

@RestController
@RequestMapping("/trustifier/verifier")
public class Verifier {

	@Autowired
	private Hasher hasher;
	@Autowired
	private BlockchainRestClient blockchainRestClient;


	@PostMapping("taskInteraction")
	public boolean verifyTaskInteraction(@RequestBody TaskDTO task) {
		return blockchainRestClient.isTaskInteractionHashInBc(hasher.generateHash(task));
	}

	@PostMapping("taskEntry")
	public boolean verifyTaskEntry(@RequestBody TaskEntry taskEntry) {
		return blockchainRestClient.isTaskEntryHashInBc(hasher.generateHash(taskEntry));
	}

	@PostMapping("competenceEntry")
	public boolean verifyCompetence(@RequestBody CompetenceEntry competenceEntry) {
		return blockchainRestClient.isCompetenceEntryHashInBc(hasher.generateHash(competenceEntry));
	}

}