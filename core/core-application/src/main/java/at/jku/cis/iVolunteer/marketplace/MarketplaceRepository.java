package at.jku.cis.iVolunteer.marketplace;

import org.springframework.data.mongodb.repository.MongoRepository;

import at.jku.cis.iVolunteer.model.marketplace.Marketplace;

public interface MarketplaceRepository extends MongoRepository<Marketplace, String>{

}
