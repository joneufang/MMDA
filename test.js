"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//import * as MxAA from "./MxAObjectAdapter";
var MMDA = require("./MendixMetaDataAPI");
var MMDAQueryConstants_1 = require("./MMDAQueryConstants");
var MMDAQueryConstants_2 = require("./MMDAQueryConstants");
var username = 'jochen.neufang@mansystems.de';
var apikey = 'e6a890bf-6377-4395-8924-87bfe8da7330';
var projectId = "01bfc705-81e4-4ffa-8bc9-0c43e7f2b5ba";
var projectIdTestapp = '63c56da2-8dd9-4114-8cc5-248914c72573';
var projectIdNutrician = '0e5f230a-0269-43ac-bb2f-77bf837c722f';
var project = new MMDA.MMDAProject(username, apikey, projectId);
//let project = new mendixanalytics.MxAToXMLFile(username, apikey, projectId, "./Test.xml");
//project.getDocumentsFromProject([qrycons.propertys.ALL], [], [], [1]); //All Propertys unfiltered
//project.getDocumentsFromProject([qrycons.propertys.ID,qrycons.propertys.NAME, qrycons.propertys.TYPE, qrycons.propertys.CONTAINER], [], [], [qrycons.sorting.TYPE,qrycons.sorting.NAME]);  //unfiltered Result with sorting
//project.getProjectDocumentsAsXML([docs.ID,docs.NAME, docs.TYPE, docs.CONTAINER],[new MMDA.Filter(docs.NAME, "Testapp")], [docs.TYPE,docs.NAME],  "./Documents.xml");  //filtered Result with sorting
//project.getProjectConstantsAsXML([cons.ID, cons.NAME, cons.TYPE, cons.CONTAINER, cons.DATATYPE, cons.DATAVALUE],[],[],"./Constants.xml");
//project.getProjectDomainModelsAsXML([dms.ID, dms.TYPE, dms.ENTITIES, dms.ASSOCIATIONS],[],[],"./domainmodels.xml");
//project.getProjectEnumerationsAsXML([enums.ID, enums.NAME, enums.TYPE, enums.CONTAINER, enums.VALUES],[],[],"./enumerations.xml");
//project.getProjectImageCollectionsAsXML([imgcol.ID, imgcol.NAME, imgcol.TYPE, imgcol.CONTAINER, imgcol.IMAGES],[],[],"./imagecollections.xml");
//project.getProjectFoldersAsXML([fold.ID, fold.NAME, fold.TYPE, fold.CONTAINER, fold.SUBFOLDERS, fold.DOCUMENTS],[],[],"./folders.xml");
//project.getProjectLayoutsAsXML([lay.ID, lay.NAME, lay.TYPE, lay.CONTAINER, lay.LAYOUTTYPE],[],[],"./layouts.xml");
//project.getProjectMicroflowsAsXML([mf.ID, mf.NAME, mf.TYPE, mf.CONTAINER, mf.RETURNTYPE],[],[],"./microflows.xml");
//project.getProjectModulesAsXML([mod.ID, mod.NAME, mod.TYPE, mod.FOLDERS, mod.DOCUMENTS],[],[],"./modules.xml");
//project.getProjectPagesAsTXT([pag.ID, pag.NAME, pag.TYPE, pag.LAYOUT, pag.ALLOWEDROLES, pag.URL],[],[new MMDA.Sorter(pag.NAME,false)],"./pagesDSC.txt");
//project.getProjectPagesAsTXT([pag.ID, pag.NAME, pag.TYPE, pag.LAYOUT, pag.ALLOWEDROLES, pag.URL],[],[new MMDA.Sorter(pag.NAME,true)],"./pagesASC.txt");
//project.getProjectPagesAsXML([pag.ID, pag.NAME, pag.TYPE, pag.CONTAINER, pag.LAYOUT, pag.ALLOWEDROLES, pag.URL],[],[],"./pages.xml");
//project.getProjectRegularExpressionsAsXML([regex.ID, regex.NAME, regex.TYPE, regex.CONTAINER, regex.REGEX],[],[],"./regularexpressions.xml");
//project.getProjectSnippetsAsXML([snip.ID, snip.NAME, snip.TYPE, snip.CONTAINER, snip.ENTITY],[],[],"./snippets.xml");
//project.getDocumentsFromProject([qrycons.propertys.ID,qrycons.propertys.NAME,qrycons.propertys.TYPE], [qrycons.filter.TYPE,qrycons.filter.NAME], ["Microflow","Testapp"], []); //filtered Result
//project.getDocumentsFromProject([qrycons.documents.propertys.ID,qrycons.documents.propertys.NAME,qrycons.documents.propertys.TYPE], [qrycons.documents.filter.TYPE], ["No Result Entry"], [1]); //No Result
//project.getModuleDocumentsAsTXT("Testapp",[docs.ID,docs.NAME, docs.TYPE, docs.CONTAINER],[], [],  "./ModuleDocuments.txt");
//project.getModuleDomainModelsAsXML("Testapp",[dms.ID, dms.TYPE, dms.ENTITIES, dms.ASSOCIATIONS],[], [],  "./ModuleDomainModels.xml");
//project.getFolderConstantsAsXML("0 Test Constants",[cons.ID, cons.NAME, cons.TYPE, cons.DATATYPE, cons.DATAVALUE],[],[],"./FolderConstants.xml");
//project.getModuleConstantsAsXML("Testapp",[cons.ID, cons.NAME, cons.TYPE, cons.DATATYPE, cons.DATAVALUE],[],[],"./ModuleConstants.xml");
//project.getModuleEnumerationsAsXML("Testapp",[enums.ID, enums.NAME, enums.TYPE, enums.CONTAINER, enums.VALUES],[],[],"./Moduleenumerations.xml");
//project.getFolderEnumerationsAsXML("00 Common",[enums.ID, enums.NAME, enums.TYPE, enums.CONTAINER, enums.VALUES],[],[],"./Folderenumerations.xml");
//project.getModuleImageCollectionsAsXML("Testapp", [imgcol.ID, imgcol.NAME, imgcol.TYPE, imgcol.CONTAINER, imgcol.IMAGES],[],[],"./Moduleimagecollections.xml");
//project.getFolderFoldersAsTXT("14 Textbox and Textarea",[fold.ID, fold.NAME, fold.TYPE, fold.CONTAINER, fold.SUBFOLDERS, fold.DOCUMENTS],[],[],"./Folderfolders.txt");
//project.getModuleFoldersAsTXT("Testapp", [fold.ID, fold.NAME, fold.TYPE, fold.CONTAINER, fold.SUBFOLDERS, fold.DOCUMENTS],[],[],"./Modulefolders.txt");
//project.getFolderLayoutsAsXML("00 Common", [lay.ID, lay.NAME, lay.TYPE, lay.CONTAINER, lay.LAYOUTTYPE],[],[],"./Folderlayouts.xml");
//project.getModuleLayoutsAsXML("Testapp", [lay.ID, lay.NAME, lay.TYPE, lay.CONTAINER, lay.LAYOUTTYPE],[],[],"./Modulelayouts.xml");
//project.getFolderMicroflowsAsXML("00 Common", [mf.ID, mf.NAME, mf.TYPE, mf.CONTAINER, mf.RETURNTYPE],[],[],"./Foldermicroflows.xml");
//project.getModuleMicroflowsAsXML("Testapp", [mf.ID, mf.NAME, mf.TYPE, mf.CONTAINER, mf.RETURNTYPE],[],[],"./Modulemicroflows.xml");
//project.getFolderPagesAsXML("40 Simple Checkbox Set Selector",[pag.ID, pag.NAME, pag.TYPE, pag.CONTAINER, pag.LAYOUT, pag.ALLOWEDROLES, pag.URL],[],[],"./Folderpages.xml");
//project.getModulePagesAsXML("Testapp",[pag.ID, pag.NAME, pag.TYPE, pag.CONTAINER, pag.LAYOUT, pag.ALLOWEDROLES, pag.URL],[],[],"./Modulepages.xml");
//project.getFolderRegularExpressionsAsXML("Resources",[regex.ID, regex.NAME, regex.TYPE, regex.CONTAINER, regex.REGEX],[],[],"./Folderregularexpressions.xml");
//project.getModuleSnippetsAsXML("Testapp",[snip.ID, snip.NAME, snip.TYPE, snip.CONTAINER, snip.ENTITY],[],[],"./Modulesnippets.xml");
//project.getFolderSnippetsAsXML("02 Button, Link, Label",[snip.ID, snip.NAME, snip.TYPE, snip.CONTAINER, snip.ENTITY],[],[],"./Foldersnippets.xml");
//project.getFolderDocumentsAsXML("00 Common",[docs.ID,docs.NAME, docs.TYPE, docs.CONTAINER],[], [],  "./FolderDocuments.xml");
//project.getFolderDocumentsAsJSON("00 Common",[qrycons.ID,qrycons.NAME, qrycons.TYPE, qrycons.CONTAINER],[], [qrycons.TYPE,qrycons.NAME],  "./Test.json");
//project.getFolderDocumentsAsHTML("00 Common",[qrycons.ID,qrycons.NAME, qrycons.TYPE, qrycons.CONTAINER],[], [qrycons.TYPE,qrycons.NAME],  "./Test.html");
//qrycons.propertys.ID,qrycons.propertys.NAME, qrycons.propertys.TYPE, qrycons.propertys.CONTAINER
project.getProjectCustomWidgetsAsXML([MMDAQueryConstants_1.customwidgetcalls.NAME, MMDAQueryConstants_1.customwidgetcalls.TYPE, MMDAQueryConstants_1.customwidgetcalls.CALLCOUNT, MMDAQueryConstants_1.customwidgetcalls.CALLLOCATIONS], [], [], "./customwidgets.xml");
//project.getProjectWidgetsAsXML([w.NAME, w.TYPE, w.CALLCOUNT, w.CALLLOCATIONS],[],[],"./widgets.xml");
project.getProjectMicroflowCallsAsXML([MMDAQueryConstants_2.microflowcalls.ID, MMDAQueryConstants_2.microflowcalls.NAME, MMDAQueryConstants_2.microflowcalls.TYPE, MMDAQueryConstants_2.microflowcalls.CALLCOUNT, MMDAQueryConstants_2.microflowcalls.CALLLOCATIONS], [], [], "./microflowcalls.xml");
/* //WidgetType test

var client = new MendixSdkClient(username, apikey);
var project = new Project(client, projectId, "");


project.createWorkingCopy().then((workingCopy) => {
    return workingCopy.model().allDocuments();
})
.then((documents) => {
    
    return loadAllDocumentsAsPromise(documents);
})
.done((loadeddocs) => {

    loadeddocs.forEach((doc) => {
       
        doc.traverse((structure) => {
            if(structure instanceof pages.Widget && !(structure.structureTypeName === "CustomWidgets$CustomWidget")) {
                var widget : pages.Widget;
                widget = structure;
                console.log(widget.class + ";" + widget.name + ";" + widget.structureTypeName);
            }
        });
        
        
    });


    //Auslagern !!!!!!!!!!
    console.log("Im Done!!!");
    

});

function loadAllDocumentsAsPromise(documents: projects.IDocument[]): when.Promise<projects.Document[]> {
    return when.all<projects.Document[]>(documents.map( doc => loadAsPromise(doc)));
} */
/* //Counter Test
var counter1 : MxAO.OutputObjectCounter;
counter1 = new MxAO.OutputObjectCounter([],"Wohnzimmer");
counter1.addProperty("ID","Test");

var counter2 : MxAO.OutputObjectCounter;
counter2 = new MxAO.OutputObjectCounter([],"Küche");
counter2.addProperty("ID","Test");

var counter3 : MxAO.OutputObjectCounter;
counter3 = new MxAO.OutputObjectCounter([],"Schlafzimmer");
counter3.addProperty("ID","Test2");

var counterlist : MxAO.OutputObjectCounterList;
counterlist = new MxAO.OutputObjectCounterList();

counterlist.addAndCount(counter1);
counterlist.addAndCount(counter2);
counterlist.addAndCount(counter3);


console.log(counterlist.toString());

*/
/* //REPLACE TEST
var client = new MendixSdkClient(username, apikey);
var project = new Project(client, projectId, "");


project.createWorkingCopy().then((workingCopy) => {
    return workingCopy.model().allDocuments();
})
.then((documents) => {
    
    return loadAllDocumentsAsPromise(documents);
})
.done((loadeddocs) => {

    loadeddocs.forEach((doc) => {
       
        var text = doc.documentation
        //text = text.replace(/(\r\n\t|\n|\r\t)/gm,"");
        text = text.replace(/\r/g, "");
        text = text.replace(/\n/g, "\t");
        console.log(text);
        console.log("\n\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n\n");
        
        
    });


    //Auslagern !!!!!!!!!!
    console.log("Im Done!!!");
    

});

function loadAllDocumentsAsPromise(documents: projects.IDocument[]): when.Promise<projects.Document[]> {
    return when.all<projects.Document[]>(documents.map( doc => loadAsPromise(doc)));
}*/
/*  //SORTING TEST
var objects : MxAO.MxAOutputObjectList = new MxAO.MxAOutputObjectList();

var props : MxAO.MxAOutputObjectProperty[] = new Array();
props[0] = new MxAO.MxAOutputObjectProperty("NAME","a");
props[1] = new MxAO.MxAOutputObjectProperty("TYPE","MF");
var object = new MxAO.MxAOutputObject(props)
objects.addObject(object)

var props : MxAO.MxAOutputObjectProperty[] = new Array();
props[0] = new MxAO.MxAOutputObjectProperty("NAME","f");
props[1] = new MxAO.MxAOutputObjectProperty("TYPE","CW");
var object = new MxAO.MxAOutputObject(props)
objects.addObject(object)

var props : MxAO.MxAOutputObjectProperty[] = new Array();
props[0] = new MxAO.MxAOutputObjectProperty("NAME","c");
props[1] = new MxAO.MxAOutputObjectProperty("TYPE","MF");
var object = new MxAO.MxAOutputObject(props)
objects.addObject(object)

var props : MxAO.MxAOutputObjectProperty[] = new Array();
props[0] = new MxAO.MxAOutputObjectProperty("NAME","b");
props[1] = new MxAO.MxAOutputObjectProperty("TYPE","CW");
var object = new MxAO.MxAOutputObject(props)
objects.addObject(object)

var props : MxAO.MxAOutputObjectProperty[] = new Array();
props[0] = new MxAO.MxAOutputObjectProperty("NAME","d");
props[1] = new MxAO.MxAOutputObjectProperty("TYPE","D");
var object = new MxAO.MxAOutputObject(props)
objects.addObject(object)

var props : MxAO.MxAOutputObjectProperty[] = new Array();
props[0] = new MxAO.MxAOutputObjectProperty("NAME","e");
props[1] = new MxAO.MxAOutputObjectProperty("TYPE","D");
var object = new MxAO.MxAOutputObject(props)
objects.addObject(object)

console.log("VorSort\n");
console.log(objects.toTextFileString());
console.log("VorSort\n");

var sortedobjects = objects.sort([qrycons.sorting.TYPE,qrycons.sorting.NAME]);

console.log("NachSort\n");
console.log(sortedobjects.toTextFileString());
console.log("NachSort\n");*/
//XMLWRITER TEST
/*
var xml = new XMLWriter();

xml.startDocument();
xml.startElement("MxAObject");
xml.startElement("ID");
xml.text("idvalue");
xml.endElement();
xml.startElement("Name");
xml.text("Namevalue");
xml.endElement();
xml.startElement("Type");
xml.text("Typevalue");
xml.endElement();
xml.endElement();
xml.endDocument();

fs.outputFile("Test.xml",xml.toString());*/
