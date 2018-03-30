package at.jku.cis.marketplace.competence;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface CompetenceRepository extends MongoRepository<Competence, String> {

	Competence findByName(String name);
}
