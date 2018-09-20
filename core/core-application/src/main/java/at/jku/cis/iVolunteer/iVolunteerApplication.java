package at.jku.cis.iVolunteer;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import at.jku.cis.iVolunteer.core.helpseeker.CoreHelpSeekerRepository;
import at.jku.cis.iVolunteer.core.marketplace.MarketplaceRepository;
import at.jku.cis.iVolunteer.core.volunteer.CoreVolunteerRepository;
import at.jku.cis.iVolunteer.model.core.user.CoreHelpSeeker;
import at.jku.cis.iVolunteer.model.core.user.CoreVolunteer;
import at.jku.cis.iVolunteer.model.marketplace.Marketplace;

@SpringBootApplication
public class iVolunteerApplication {

	private static final String MARKETPLACE_ID = "0eaf3a6281df11e8adc0fa7ae01bbebc";
	private static final String MARKETPLACE_NAME = "Marketplace 1";
	private static final String MARKETPLACE_SHORTNAME = "MP1";
	private static final String MARKETPLACE_URL = "http://localhost:8080";

	private static final String MMUSTERMANN = "mmustermann";
	private static final String MWEISSENBEK = "mweissenbek";
	private static final String PSTARZER = "pstarzer";
	private static final String BROISER = "broiser";

	private static final String RAW_PASSWORD = "passme";

	@Autowired
	private BCryptPasswordEncoder bCryptPasswordEncoder;

	@Autowired
	private CoreHelpSeekerRepository coreHelpSeekerRepository;
	@Autowired
	private CoreVolunteerRepository coreVolunteerRepository;

	@Autowired
	private MarketplaceRepository marketplaceRepository;

	public static void main(String[] args) {
		SpringApplication.run(iVolunteerApplication.class, args);
	}

	@PostConstruct
	private void init() {
		Marketplace marketplace = createMarketplace();
		createHelpSeeker(MMUSTERMANN, RAW_PASSWORD, marketplace);
		createVolunteer(BROISER, RAW_PASSWORD);
		createVolunteer(PSTARZER, RAW_PASSWORD);
		createVolunteer(MWEISSENBEK, RAW_PASSWORD);

	}

	private Marketplace createMarketplace() {
		Marketplace marketplace = marketplaceRepository.findOne(MARKETPLACE_ID);
		if (marketplace == null) {
			marketplace = new Marketplace();
			marketplace.setId(MARKETPLACE_ID);
			marketplace.setUrl(MARKETPLACE_URL);
			marketplace.setName(MARKETPLACE_NAME);
			marketplace.setShortName(MARKETPLACE_SHORTNAME);
			marketplaceRepository.insert(marketplace);
		}
		return marketplace;
	}

	private CoreHelpSeeker createHelpSeeker(String username, String password, Marketplace marketplace) {
		CoreHelpSeeker helpSeeker = coreHelpSeekerRepository.findByUsername(username);
		if (helpSeeker == null) {
			helpSeeker = new CoreHelpSeeker();
			helpSeeker.setUsername(username);
			helpSeeker.setPassword(bCryptPasswordEncoder.encode(password));
			helpSeeker.getRegisteredMarketplaces().clear();
			helpSeeker.getRegisteredMarketplaces().add(marketplace);
			helpSeeker = coreHelpSeekerRepository.insert(helpSeeker);
		}
		return helpSeeker;
	}

	private CoreVolunteer createVolunteer(String username, String password) {
		CoreVolunteer volunteer = coreVolunteerRepository.findByUsername(username);
		if (volunteer == null) {
			volunteer = new CoreVolunteer();
			volunteer.setUsername(username);
			volunteer.setPassword(bCryptPasswordEncoder.encode(password));
			volunteer = coreVolunteerRepository.insert(volunteer);
		}
		return volunteer;
	}
}
