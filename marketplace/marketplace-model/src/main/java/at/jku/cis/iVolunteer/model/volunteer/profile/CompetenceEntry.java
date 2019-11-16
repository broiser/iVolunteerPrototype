package at.jku.cis.iVolunteer.model.volunteer.profile;

import java.util.Date;

import com.google.gson.JsonObject;

import at.jku.cis.iVolunteer.model.hash.IHashObject;

public class CompetenceEntry implements IHashObject {

	private String id;
	private String competenceId;
	private String competenceName;
	private String marketplaceId;
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

	@Override
	public int hashCode() {
		return id.hashCode();
	}

	@Override
	public boolean equals(Object obj) {
		if (!(obj instanceof CompetenceEntry)) {
			return false;
		}
		return ((CompetenceEntry) obj).id.equals(id);
	}

	@Override
	public String toString() {
		return "CompetenceEntry [id=" + id + ", competenceId=" + competenceId + ", competenceName=" + competenceName

				+ ", marketplaceId=" + marketplaceId + ", timestamp=" + timestamp + "]";
	}

	@Override
	public String toHashObject() {
		JsonObject json = new JsonObject();
		json.addProperty("id", id);
		json.addProperty("competenceId", competenceId);
		json.addProperty("competenceName", competenceName);
		json.addProperty("timestamp", timestamp.toString());
		return json.toString();
	}

}
