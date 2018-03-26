//import {ModelSdkClient, IModel, IModelUnit, domainmodels, utils, pages, customwidgets, projects, documenttemplates} from "mendixmodelsdk";
//import {MendixSdkClient, Project, OnlineWorkingCopy, loadAsPromise} from "mendixplatformsdk";
//import when = require("when");
//import XMLWriter = require('xml-writer');
//import fs = require("fs-extra");
//import * as MxAO from "./MxAOutputObject";
//import * as MxAA from "./MxAObjectAdapter";
import * as MMDA from "./MendixMetaDataAPI";
import { documents as docs } from "./MMDAQueryConstants";
import { constants as cons } from "./MMDAQueryConstants";
import { domainmodels as dms } from "./MMDAQueryConstants";
import { enumerations as enums } from "./MMDAQueryConstants";
import { imagecollections as imgcol } from "./MMDAQueryConstants";
import { folders as fold } from "./MMDAQueryConstants";
import { layouts as lay } from "./MMDAQueryConstants";



const username = 'jochen.neufang@mansystems.de';
const apikey = 'e6a890bf-6377-4395-8924-87bfe8da7330';
let projectId = `01bfc705-81e4-4ffa-8bc9-0c43e7f2b5ba`;


let project = new MMDA.MMDAProject(username, apikey, projectId);
//let project = new mendixanalytics.MxAToXMLFile(username, apikey, projectId, "./Test.xml");
//project.getDocumentsFromProject([qrycons.propertys.ALL], [], [], [1]); //All Propertys unfiltered
//project.getDocumentsFromProject([qrycons.propertys.ID,qrycons.propertys.NAME, qrycons.propertys.TYPE, qrycons.propertys.CONTAINER], [], [], [qrycons.sorting.TYPE,qrycons.sorting.NAME]);  //unfiltered Result with sorting
project.getProjectDocumentsAsXML([docs.ID,docs.NAME, docs.TYPE, docs.CONTAINER],[new MMDA.Filter(docs.NAME, "Testapp")], [docs.TYPE,docs.NAME],  "./Documents.xml");  //filtered Result with sorting
project.getProjectConstantsAsXML([cons.ID, cons.NAME, cons.TYPE, cons.DATATYPE, cons.DATAVALUE],[],[],"./Constants.xml");
project.getProjectDomainModelsAsXML([dms.ID, dms.TYPE, dms.ENTITIES, dms.ASSOCIATIONS],[],[],"./domainmodels.xml");
//project.getProjectEnumerationsAsTXT([enums.ID, enums.NAME, enums.TYPE, enums.VALUES],[],[],"./enums.txt");
//project.getProjectImageCollectionsAsXML([imgcol.ID, imgcol.NAME, imgcol.TYPE, imgcol.IMAGES],[],[],"./imagecollections.xml");
//project.getProjectFoldersAsXML([fold.ID, fold.NAME, fold.TYPE, fold.SUBFOLDERS, fold.DOCUMENTS],[],[],"./folders.xml");
//project.getProjectLayoutsAsXML([lay.ID, lay.NAME, lay.TYPE, lay.LAYOUTTYPE],[],[],"./layouts.xml");
//project.getDocumentsFromProject([qrycons.propertys.ID,qrycons.propertys.NAME,qrycons.propertys.TYPE], [qrycons.filter.TYPE,qrycons.filter.NAME], ["Microflow","Testapp"], []); //filtered Result
//project.getDocumentsFromProject([qrycons.documents.propertys.ID,qrycons.documents.propertys.NAME,qrycons.documents.propertys.TYPE], [qrycons.documents.filter.TYPE], ["No Result Entry"], [1]); //No Result
project.getModuleDocumentsAsXML("Testapp",[docs.ID,docs.NAME, docs.TYPE, docs.CONTAINER],[], [],  "./ModuleDocuments.xml");
project.getFolderDocumentsAsXML("00 Common",[docs.ID,docs.NAME, docs.TYPE, docs.CONTAINER],[], [],  "./FolderDocuments.xml");
//project.getFolderDocumentsAsJSON("00 Common",[qrycons.ID,qrycons.NAME, qrycons.TYPE, qrycons.CONTAINER],[], [qrycons.TYPE,qrycons.NAME],  "./Test.json");
//project.getFolderDocumentsAsHTML("00 Common",[qrycons.ID,qrycons.NAME, qrycons.TYPE, qrycons.CONTAINER],[], [qrycons.TYPE,qrycons.NAME],  "./Test.html");
//qrycons.propertys.ID,qrycons.propertys.NAME, qrycons.propertys.TYPE, qrycons.propertys.CONTAINER





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
