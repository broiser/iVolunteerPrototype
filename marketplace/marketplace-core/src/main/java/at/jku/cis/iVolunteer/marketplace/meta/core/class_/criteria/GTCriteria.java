package at.jku.cis.iVolunteer.marketplace.meta.core.class_.criteria;

import java.util.List;
import java.util.Locale;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.stream.Collectors;

import at.jku.cis.iVolunteer.model.meta.core.clazz.ClassInstance;
import at.jku.cis.iVolunteer.model.meta.core.property.PropertyType;
import at.jku.cis.iVolunteer.model.meta.core.property.instance.PropertyInstance;

public class GTCriteria extends SingleCriteria {

	public GTCriteria(String propertyId, Object value) {
		super(propertyId, value);
	}
	
	protected boolean filterByCriteria(PropertyInstance<Object> pi) {
		switch (pi.getType()) {
		case DATE:
			return pi.getValues().stream().anyMatch(v -> 
				convert((Date)v).isAfter(parse(value))
				);
		case FLOAT_NUMBER:
			return pi.getValues().stream().anyMatch(v -> (Double)v > (Double)value);
		case WHOLE_NUMBER:
		    return pi.getValues().stream().anyMatch(v -> Integer.parseInt((String)v) > Integer.parseInt((String) value));
		default:
			return false;
		}
	}
}
	