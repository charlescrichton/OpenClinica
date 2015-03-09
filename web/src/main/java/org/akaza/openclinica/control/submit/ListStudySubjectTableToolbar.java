package org.akaza.openclinica.control.submit;

import org.akaza.openclinica.bean.managestudy.StudyEventDefinitionBean;
import org.akaza.openclinica.bean.managestudy.StudyGroupClassBean;
import org.akaza.openclinica.control.DefaultToolbar;
import org.akaza.openclinica.i18n.util.ResourceBundleProvider;
import org.jmesa.core.CoreContext;
import org.jmesa.view.html.HtmlBuilder;
import org.jmesa.view.html.toolbar.AbstractItem;
import org.jmesa.view.html.toolbar.AbstractItemRenderer;
import org.jmesa.view.html.toolbar.ClearItemRenderer;
import org.jmesa.view.html.toolbar.ToolbarItem;
import org.jmesa.view.html.toolbar.ToolbarItemRenderer;
import org.jmesa.view.html.toolbar.ToolbarItemType;

import java.util.ArrayList;
import java.util.ResourceBundle;

public class ListStudySubjectTableToolbar extends DefaultToolbar {

    private final ArrayList<StudyEventDefinitionBean> studyEventDefinitions;
    private final ArrayList<StudyGroupClassBean> studyGroupClasses;
    private final boolean addSubjectLinkShow;
    private ResourceBundle reswords = ResourceBundleProvider.getWordsBundle();

    public ListStudySubjectTableToolbar(ArrayList<StudyEventDefinitionBean> studyEventDefinitions, ArrayList<StudyGroupClassBean> studyGroupClasses,
            boolean addSubjectLinkShow, boolean showMoreLink) {
        super();
        this.studyEventDefinitions = studyEventDefinitions;
        this.studyGroupClasses = studyGroupClasses;
        this.addSubjectLinkShow = addSubjectLinkShow;
        this.showMoreLink = showMoreLink;
    }

    @Override
    protected void addToolbarItems() {
        addToolbarItem(ToolbarItemType.SEPARATOR);
        addToolbarItem(createCustomItem(new ShowMoreItem()));

        addToolbarItem(ToolbarItemType.SEPARATOR);
        addToolbarItem(createCustomItem(new StudyEventDefinitionDropDownItem()));
        addToolbarItem(createCustomItem(new NewHiddenItem()));
        if (addSubjectLinkShow) {
            addToolbarItem(createAddSubjectItem());
        }
    }

    private ToolbarItem createCustomItem(AbstractItem item) {

        ToolbarItemRenderer renderer = new CustomItemRenderer(item, getCoreContext());
        renderer.setOnInvokeAction("onInvokeAction");
        item.setToolbarItemRenderer(renderer);

        return item;
    }

    public ToolbarItem createAddSubjectItem() {

        AddNewSubjectItem item = new AddNewSubjectItem();
        item.setCode(ToolbarItemType.CLEAR_ITEM.toCode());
        ToolbarItemRenderer renderer = new ClearItemRenderer(item, getCoreContext());
        renderer.setOnInvokeAction("onInvokeAction");
        item.setToolbarItemRenderer(renderer);

        return item;
    }

    private class ShowMoreItem extends AbstractItem {

        @Override
        public String disabled() {
            // TODO Auto-generated method stub
            return null;
        }

        @Override
        public String enabled() {
            HtmlBuilder html = new HtmlBuilder();
            if(showMoreLink){
                          html.a().id("showMore").href("javascript:hideCols('findSubjects',[" + getIndexes() + "],true);").close();
            html.div().close().nbsp().append(reswords.getString("show_more")).nbsp().divEnd().aEnd();
            html.a().id("hide").style("display: none;").href("javascript:hideCols('findSubjects',[" + getIndexes() + "],false);").close();
            html.div().close().nbsp().append(reswords.getString("hide")).nbsp().divEnd().aEnd();

                html.script().type("text/javascript").close().append(
                        "$j = jQuery.noConflict(); $j(document).ready(function(){ " + "hideCols('findSubjects',[" + getIndexes() + "],false);});").scriptEnd();
            }else{
                html.a().id("hide").href("javascript:hideCols('findSubjects',[" + getIndexes() + "],false);").close();
                html.div().close().nbsp().append(reswords.getString("hide")).nbsp().divEnd().aEnd();
                html.a().id("showMore").style("display: none;").href("javascript:hideCols('findSubjects',[" + getIndexes() + "],true);").close();
                html.div().close().nbsp().append(reswords.getString("show_more")).nbsp().divEnd().aEnd();
            }
            return html.toString();
        }

        /**
         * @return Dynamically generate the indexes of studyGroupClasses. It
         *         starts from 10 because there are 10 columns before study group
         *         columns that will require to be hidden.
         * @see ListStudySubjectTableFactory#configureColumns(org.jmesa.facade.TableFacade,
         *      java.util.Locale)
         */
        String getIndexes() {
            /* Modified by crc so that the first 7 columns (0,1,2,3,4,5,6,7) are not hidden, (8,9,10) are hidden */
            /*

                columnNamesList.add("label");
                columnNamesList.add(BESPOKE_FAMILY_ID);
                columnNamesList.add(BESPOKE_SURNAME);
                columnNamesList.add(BESPOKE_FORENAMES);
                columnNamesList.add(BESPOKE_DOB);
                columnNamesList.add(BESPOKE_NHS_NUMBER);
                columnNamesList.add(BESPOKE_HOSPITAL_NUMBER);
                columnNamesList.add("subject.charGender");

                columnNamesList.add("secondaryLabel");
                columnNamesList.add("status");
                columnNamesList.add("enrolledAt");

             */
            String result = "8,9,10";
            for (int i = 0; i < studyGroupClasses.size(); i++) {
                result += "," + (10 + i + 1);
            }
            return result;
        }

    }

    private class StudyEventDefinitionDropDownItem extends AbstractItem {

        @Override
        public String disabled() {
            // TODO Auto-generated method stub
            return null;
        }

        @Override
        public String enabled() {
            String js =
                "var selectedValue = document.getElementById('sedDropDown').options[document.getElementById('sedDropDown').selectedIndex].value;  "
                    + " if (selectedValue != null  ) { " + "window.location='ListEventsForSubjects?module=submit&defId=' + selectedValue;" + " } ";
            HtmlBuilder html = new HtmlBuilder();
            html.select().id("sedDropDown").onchange(js).close();
            html.option().close().append(reswords.getString("select_an_event")).optionEnd();
            for (StudyEventDefinitionBean studyEventDefinition : studyEventDefinitions) {
                html.option().value(String.valueOf(studyEventDefinition.getId())).close().append(studyEventDefinition.getName()).optionEnd();
            }
            html.selectEnd();
            return html.toString();
        }

    }

    private class AddNewSubjectItem extends AbstractItem {

        @Override
        public String disabled() {
            // TODO Auto-generated method stub
            return null;
        }

        @Override
        public String enabled() {
            HtmlBuilder html = new HtmlBuilder();
            //@pgawade 25-June-2012: fix for issue 14427 
            //html.a().href("#").id("addSubject");// onclick(
            html.a().href("javascript:;").id("addSubject");
            // "initmb();sm('box', 730,100);"
            // );
            html.quote();
            html.quote().close();
            html.nbsp().append(reswords.getString("add_new_subject")).nbsp().aEnd();

            return html.toString();
        }

    }

    private static class CustomItemRenderer extends AbstractItemRenderer {
        public CustomItemRenderer(ToolbarItem item, CoreContext coreContext) {
            setToolbarItem(item);
            setCoreContext(coreContext);
        }

        public String render() {
            ToolbarItem item = getToolbarItem();
            return item.enabled();
        }
    }

}
