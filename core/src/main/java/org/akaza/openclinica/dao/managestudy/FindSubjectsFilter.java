package org.akaza.openclinica.dao.managestudy;

import org.akaza.openclinica.bean.core.SubjectEventStatus;
import org.akaza.openclinica.i18n.util.ResourceBundleProvider;
import org.apache.commons.lang.StringEscapeUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.print.DocFlavor;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;

public class FindSubjectsFilter implements CriteriaCommand {

    //protected final Logger logger = LoggerFactory.getLogger(getClass().getName());

    List<Filter> filters = new ArrayList<Filter>();
    HashMap<String, String> columnMapping = new HashMap<String, String>();

    public final static String BESPOKE_FAMILY_ID = "familyId";
    public final static String BESPOKE_SURNAME = "surname";
    public final static String BESPOKE_FORENAMES = "forenames";
    public final static String BESPOKE_DOB = "dob";
    public final static String BESPOKE_NHS_NUMBER = "nhsNumber";
    public final static String BESPOKE_HOSPITAL_NUMBER = "hospitalNumber";
    public final static String BESPOKE_SLF_DOWNLOADED = "slfDownloaded";

    /*
    <query>
    <name>getWithFilterAndSort</name>
    <sql>SELECT DISTINCT(ss.*), ST.unique_identifier
    FROM study_subject ss LEFT JOIN study_event se ON ss.study_subject_id = se.study_subject_id,STUDY ST,SUBJECT S
            where
    SS.SUBJECT_ID=S.SUBJECT_ID
    AND SS.study_id = ST.study_id
                      AND (ST.study_id=? or ST.parent_study_id=?)
    </sql>
    </query>
    */
    public FindSubjectsFilter() {
        columnMapping.put("studySubject.label", "ss.label");
        columnMapping.put("studySubject.status", "ss.status_id");
        columnMapping.put("studySubject.oid", "ss.oc_oid");
        columnMapping.put("enrolledAt", "ST.unique_identifier");
        columnMapping.put("studySubject.secondaryLabel", "ss.secondary_label");
        columnMapping.put("subject.charGender", "s.gender");
        columnMapping.put(BESPOKE_FAMILY_ID, "ss.gel_family_id");
        columnMapping.put(BESPOKE_SURNAME, "ss.gel_surname");
        columnMapping.put(BESPOKE_FORENAMES, "ss.gel_forenames");
        columnMapping.put(BESPOKE_NHS_NUMBER, "ss.gel_nhs_number");
        columnMapping.put(BESPOKE_HOSPITAL_NUMBER, "ss.gel_hospital_number");
        columnMapping.put(BESPOKE_SLF_DOWNLOADED, "ss.gel_slf_downloaded");
        columnMapping.put(BESPOKE_DOB, "s.date_of_birth");
    }

    public void addFilter(String property, Object value) {
        filters.add(new Filter(property, value));
    }

    public String execute(String criteria) {
        String theCriteria = "";
        for (Filter filter : filters) {
            theCriteria += buildCriteria(criteria, filter.getProperty(), filter.getValue());
        }
        //logger.info("theCriteria = "+theCriteria);
        return theCriteria;
    }

    private String buildCriteria(String criteria, String property, Object value) {
        value = StringEscapeUtils.escapeSql(value.toString());
        if (value != null) {
            if (property.equals("studySubject.status")) {
                criteria = criteria + " and ";
                criteria = criteria + " " + columnMapping.get(property) + " = " + value.toString() + " ";
            } else if (property.startsWith("sed_")) {
                value = SubjectEventStatus.getSubjectEventStatusIdByName(value.toString()) + "";
                if (!value.equals("2")) {
                    criteria += " and ";
                    criteria += " ( se.study_event_definition_id = " + property.substring(4);
                    criteria += " and se.subject_event_status_id = " + value + " )";
                } else {
                    criteria += " AND (se.study_subject_id is null or (se.study_event_definition_id != " + property.substring(4);
                    criteria += " AND (select count(*) from  study_subject ss1 LEFT JOIN study_event ON ss1.study_subject_id = study_event.study_subject_id";
                    criteria +=
                        " where  study_event.study_event_definition_id =" + property.substring(4) + " and ss.study_subject_id = ss1.study_subject_id) =0))";

                }
            } else if (property.startsWith("sgc_")) {
                int study_group_class_id = Integer.parseInt(property.substring(4));

                int group_id = Integer.parseInt(value.toString());
                criteria +=
                    "AND " + group_id + " = (" + " select distinct sgm.study_group_id"
                        + " FROM SUBJECT_GROUP_MAP sgm, STUDY_GROUP sg, STUDY_GROUP_CLASS sgc, STUDY s" + " WHERE " + " sgm.study_group_class_id = "
                        + study_group_class_id + " AND sgm.study_subject_id = SS.study_subject_id" + " AND sgm.study_group_id = sg.study_group_id"
                        + " AND (s.parent_study_id = sgc.study_id OR SS.study_id = sgc.study_id)" + " AND sgm.study_group_class_id = sgc.study_group_class_id"
                        + " ) ";

            }
            /**
            else if (property.equals(BESPOKE_FAMILY_ID)) {
                criteria = criteria + " and ";
                criteria = criteria + " UPPER(" + columnMapping.get(property) + ") like UPPER('%\\[" + value.toString() + "\\]%')" + " ";
            }
            else if (property.equals(BESPOKE_SURNAME)) {
                criteria = criteria + " and ";
                criteria = criteria + " UPPER(" + columnMapping.get(property) + ") like UPPER('" + value.toString() + ",%')" + " ";
            }
            else if (property.equals(BESPOKE_FORENAMES)) {
                criteria = criteria + " and ";
                criteria = criteria + " UPPER(" + columnMapping.get(property) + ") like UPPER('%, " + value.toString() + " \\[%')" + " ";
            }
            else if (property.equals(BESPOKE_NHS_NUMBER)) {
                criteria = criteria + " and ";
                criteria = criteria + " UPPER(" + columnMapping.get(property) + ") like UPPER('%\\] " + value.toString() + "% %')" + " ";
            }
             */

            else if (property.equals(BESPOKE_DOB)) {
                criteria = criteria + " and ";
                criteria = criteria + " to_char(" + columnMapping.get(property) +", 'DD/MM/YYYY') like '%"+ value.toString() +"%' ";
            }

            else if (property.equals(BESPOKE_SLF_DOWNLOADED)) {
                criteria = criteria + " and ";

                Boolean testValue = false;
                if (value instanceof String) {
                    testValue = Boolean.valueOf((String) value);
                }

                criteria = criteria + " UPPER(cast(" + columnMapping.get(property) + " AS VARCHAR)) like UPPER('%" + value.toString() + "%')  ";

                //criteria = criteria + " " + columnMapping.get(property) + " IS "+testValue.toString().toUpperCase()+"  ";
            }

            else {
                criteria = criteria + " and ";
                criteria = criteria + " UPPER(" + columnMapping.get(property) + ") like UPPER('%" + value.toString() + "%')" + " ";
            }

        }
        return criteria;
    }



    private static class Filter {
        private final String property;
        private final Object value;

        public Filter(String property, Object value) {
            this.property = property;
            this.value = value;
        }

        public String getProperty() {
            return property;
        }

        public Object getValue() {
            return value;
        }
    }

}
