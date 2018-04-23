package at.jku.cis.marketplace.participant.profile;

import java.util.Date;

public class CompetenceEntry {

	private String id;

	private String competenceId;
	private String competenceName;

	private Date timestamp;

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getCompetenceId() {
		return competenceId;
	}

	public void setCompetenceId(String competenceId) {
		this.competenceId = competenceId;
	}

	public String getCompetenceName() {
		return competenceName;
	}

	public void setCompetenceName(String competenceName) {
		this.competenceName = competenceName;
	}

	public Date getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(Date timestamp) {
		this.timestamp = timestamp;
	}

	@Override
	public boolean equals(Object obj) {
		if (!(obj instanceof CompetenceEntry)) {
			return false;
		}
		return ((CompetenceEntry) obj).id.equals(id);
	}

	@Override
	public int hashCode() {
		return id.hashCode();
	}
}
