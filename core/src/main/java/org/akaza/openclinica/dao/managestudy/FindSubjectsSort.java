package org.akaza.openclinica.dao.managestudy;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

public class FindSubjectsSort implements CriteriaCommand {

    protected final Logger logger = LoggerFactory.getLogger(getClass().getName());

    List<Sort> sorts = new ArrayList<Sort>();
    HashMap<String, String> columnMapping = new HashMap<String, String>();

    public FindSubjectsSort() {
        /*
        columnMapping.put("studySubject.label", "label");
        columnMapping.put("studySubject.status", "status_id");
        columnMapping.put("enrolledAt", "ST.unique_identifier");
        columnMapping.put("studySubject.oid", "oc_oid");
        columnMapping.put("studySubject.secondaryLabel", "secondary_label");

//        columnMapping.put("subject.charGender", "gender");
        //columnMapping.put("subject.charGender", "s.gender");
        columnMapping.put(FindSubjectsFilter.BESPOKE_FAMILY_ID, "gel_family_id");
        columnMapping.put(FindSubjectsFilter.BESPOKE_SURNAME, "gel_surname");
        columnMapping.put(FindSubjectsFilter.BESPOKE_FORENAMES, "gel_forenames");
        columnMapping.put(FindSubjectsFilter.BESPOKE_NHS_NUMBER, "gel_nhs_number");
        columnMapping.put(FindSubjectsFilter.BESPOKE_HOSPITAL_NUMBER, "gel_hospital_number");
        columnMapping.put(FindSubjectsFilter.BESPOKE_SLF_DOWNLOADED, "gel_slf_downloaded");
*/
        columnMapping.put("studySubject.label", "ss.label");
        columnMapping.put("studySubject.status", "ss.status_id");
        columnMapping.put("studySubject.oid", "ss.oc_oid");
        columnMapping.put("enrolledAt", "ST.unique_identifier");
        columnMapping.put("studySubject.secondaryLabel", "ss.secondary_label");
        columnMapping.put("subject.charGender", "s.gender");
        columnMapping.put(FindSubjectsFilter.BESPOKE_FAMILY_ID, "ss.gel_family_id");
        columnMapping.put(FindSubjectsFilter.BESPOKE_SURNAME, "ss.gel_surname");
        columnMapping.put(FindSubjectsFilter.BESPOKE_FORENAMES, "ss.gel_forenames");
        columnMapping.put(FindSubjectsFilter.BESPOKE_NHS_NUMBER, "ss.gel_nhs_number");
        columnMapping.put(FindSubjectsFilter.BESPOKE_HOSPITAL_NUMBER, "ss.gel_hospital_number");
        columnMapping.put(FindSubjectsFilter.BESPOKE_SLF_DOWNLOADED, "ss.gel_slf_downloaded");
        //columnMapping.put(FindSubjectsFilter.BESPOKE_DOB, "s.date_of_birth");

    }

    public void addSort(String property, String order) {
        sorts.add(new Sort(property, order));
    }

    public List<Sort> getSorts() {
        return sorts;
    }

    public String execute(String criteria) {
        String theCriteria = "";
        for (Sort sort : sorts) {
            if (theCriteria.length() == 0) {
                theCriteria += buildCriteriaInitial(criteria, sort.getProperty(), sort.getOrder());
            } else {
                theCriteria += buildCriteria(criteria, sort.getProperty(), sort.getOrder());
            }

        }
        logger.info("theCriteria = "+theCriteria);
        return theCriteria;
    }

    private String buildCriteriaInitial(String criteria, String property, String order) {
        if (order.equals(Sort.ASC)) {
            criteria = criteria + " order by " + columnMapping.get(property) + " asc ";
        } else if (order.equals(Sort.DESC)) {
            criteria = criteria + " order by " + columnMapping.get(property) + " desc ";
        }
        return criteria;
    }

    private String buildCriteria(String criteria, String property, String order) {
        if (order.equals(Sort.ASC)) {
            criteria = criteria + " , " + columnMapping.get(property) + " asc ";
        } else if (order.equals(Sort.DESC)) {
            criteria = criteria + " , " + columnMapping.get(property) + " desc ";
        }
        return criteria;
    }

    private static class Sort {
        public final static String ASC = "asc";
        public final static String DESC = "desc";

        private final String property;
        private final String order;

        public Sort(String property, String order) {
            this.property = property;
            this.order = order;
        }

        public String getProperty() {
            return property;
        }

        public String getOrder() {
            return order;
        }
    }
}
