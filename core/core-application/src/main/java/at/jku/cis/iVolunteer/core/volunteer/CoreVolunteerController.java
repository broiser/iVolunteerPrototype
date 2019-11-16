package at.jku.cis.iVolunteer.core.volunteer;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import at.jku.cis.iVolunteer.core.marketplace.CoreMarketplaceRestClient;
import at.jku.cis.iVolunteer.core.marketplace.MarketplaceRepository;
import at.jku.cis.iVolunteer.model.core.user.CoreVolunteer;
import at.jku.cis.iVolunteer.model.exception.NotFoundException;
import at.jku.cis.iVolunteer.model.marketplace.Marketplace;
import at.jku.cis.iVolunteer.model.user.Volunteer;

@RestController
@RequestMapping("/volunteer")
public class CoreVolunteerController {

	@Autowired private CoreVolunteerRepository coreVolunteerRepository;
	@Autowired private MarketplaceRepository marketplaceRepository;
	@Autowired private CoreMarketplaceRestClient coreMarketplaceRestClient;

	@GetMapping("/{volunteerId}")
	public CoreVolunteer getCoreVolunteer(@PathVariable("volunteerId") String volunteerId) {
		return coreVolunteerRepository.findOne(volunteerId);
	}

	@GetMapping("/{volunteerId}/marketplaces")
	public List<Marketplace> getRegisteredMarketplaces(@PathVariable("volunteerId") String volunteerId) {
		CoreVolunteer volunteer = coreVolunteerRepository.findOne(volunteerId);
		return volunteer.getRegisteredMarketplaces();
	}

	@PostMapping("/{coreVolunteerId}/register/{marketplaceId}")
	public void registerMarketpace(@PathVariable("coreVolunteerId") String coreVolunteerId,
			@PathVariable("marketplaceId") String marketplaceId, @RequestHeader("Authorization") String authorization) {
		CoreVolunteer coreVolunteer = coreVolunteerRepository.findOne(coreVolunteerId);
		Marketplace marketplace = marketplaceRepository.findOne(marketplaceId);
		if (coreVolunteer == null || marketplace == null) {
			throw new NotFoundException();
		}

		coreVolunteer = updateCoreVolunteer(coreVolunteer, marketplace);
		registerVolunteer(authorization, coreVolunteer, marketplace);
	}

	private CoreVolunteer updateCoreVolunteer(CoreVolunteer coreVolunteer, Marketplace marketplace) {
		coreVolunteer.getRegisteredMarketplaces().add(marketplace);
		coreVolunteer = coreVolunteerRepository.save(coreVolunteer);
		return coreVolunteer;
	}

	private void registerVolunteer(String authorization, CoreVolunteer coreVolunteer, Marketplace marketplace) {
		Volunteer volunteer = new Volunteer();
		volunteer.setId(coreVolunteer.getId());
		volunteer.setUsername(coreVolunteer.getUsername());
		coreMarketplaceRestClient.registerVolunteer(marketplace.getUrl(), authorization, volunteer);
	}

}
