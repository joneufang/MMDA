import {ModelSdkClient, IModel, IModelUnit, domainmodels, utils, pages, customwidgets, projects, documenttemplates} from "mendixmodelsdk";
import {MendixSdkClient, Project, OnlineWorkingCopy, loadAsPromise} from "mendixplatformsdk";
import when = require("when");
import fs = require("fs-extra");
import * as MMDAO from "./MMDAOutputObject";
import * as MMDAA from "./MMDAObjectAdapter";
import * as qrycons from "./MMDAQueryConstants";

//Mendix Analytics Project without specified Output Type
export class MMDAProject {

    //Constants to define output target
    protected static readonly TEXTFILE = "TEXTFILE";            
    protected static readonly HTMLTABLE = "HTMLTABLE";
    protected static readonly XML = "XML";
    protected static readonly JSON = "JSON";

    protected name : string;        //username for Mendix SDK
    protected key : string;         //API-Key for Mendix SDK
    protected id : string;          //AppID for Mendix SDK

    
  

    protected client : MendixSdkClient;     //Mendix SDK client
    protected project : Project;            //Mendix SDK Project

    
    //Standard Constructor creates Mendix SDK Client and Project
    public constructor(username : string, apikey : string, appid: string) {
        this.name = username;
        this.key = apikey;
        this.id = appid;

        this.client = new MendixSdkClient(this.name, this.key);
        this.project = new Project(this.client, this.id, "");
    }

    /*
    Gets Documents from whole Project
    Parameter: qrypropertys : string[]      Array of property constants of wanted propertys
    Parameter: qryfiltertypes : string[]    Array of filter constants of propertys to filter
    Parameter: qryfiltervalues : string[]   Array of Values for the filters
    Parameter: qrysortcolumns : number[]    Array of Columnnumbers for sorting
    Parameter: qryresulttype : string       Constant which ResultType should be used
    */
    protected getProjectDocuments(qrypropertys : string[], filter : Filter[], qrysortcolumns : string[], qryresulttype : string, filename: string) {
        var outputobjects : MMDAO.OutputObjectList = new MMDAO.OutputObjectList();
        
        this.project.createWorkingCopy().then((workingCopy) => {
            return workingCopy.model().allDocuments();
        })
        .then((documents) => { 
            return this.loadAllDocumentsAsPromise(documents);
        })
        .done((loadeddocs) => {
            loadeddocs.forEach((doc) => {
                if(doc instanceof projects.Document){
                    var documentadapter : MMDAA.DocumentAdapter = new MMDAA.DocumentAdapter();
                    var propertys : MMDAO.OutputObjectProperty[] = new Array();
                    var MMDAobj : MMDAO.OutputObject;
                    propertys = documentadapter.getDocumentPropertys(doc, qrypropertys);
                    MMDAobj = new MMDAO.OutputObject(propertys,"Document");                   //Get filtered Documents
                    if(documentadapter.filter(MMDAobj,filter))
                    {
                        outputobjects.addObject(MMDAobj);                        //filter object
                    }
                }
                else
                {
                    console.log("Got Document which is not instance of projects.Document");
                }
            });
            outputobjects = outputobjects.sort(qrysortcolumns);         //Sort Objects
            outputobjects.returnResult(qryresulttype,filename);       //Return As Output Type
            console.log("Im Done!!!");
        });
    }

    public getProjectDocumentsAsHTML(propertys : string[], filter : Filter[], sortcolumn : string[], filename : string) {
        this.getProjectDocuments(propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    }

    public getProjectDocumentsAsXML(propertys : string[], filter : Filter[], sortcolumn : string[], filename : string) {
        this.getProjectDocuments(propertys, filter, sortcolumn, MMDAProject.XML, filename);
    }

    public getProjectDocumentsAsTXT(propertys : string[], filter : Filter[], sortcolumn : string[], filename : string) {
        this.getProjectDocuments(propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    }

    public getProjectDocumentsAsJSON(propertys : string[], filter : Filter[], sortcolumn : string[], filename : string) {
        this.getProjectDocuments(propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    }

    protected getModuleDocuments(modulename : string, qrypropertys : string[], filter : Filter[], qrysortcolumns : string[], qryresulttype : string, filename: string) {
        var outputobjects : MMDAO.OutputObjectList = new MMDAO.OutputObjectList();
        this.project.createWorkingCopy().then((workingCopy) => {
            return workingCopy.model().findModuleByQualifiedName(modulename);
        })
        .done((modul) => {
            modul.documents.forEach((doc) => {
                if(doc instanceof projects.Document){
                    var documentadapter : MMDAA.DocumentAdapter = new MMDAA.DocumentAdapter();
                    var propertys : MMDAO.OutputObjectProperty[] = new Array();
                    var MMDAobj : MMDAO.OutputObject;
                    propertys = documentadapter.getDocumentPropertys(doc, qrypropertys);
                    MMDAobj = new MMDAO.OutputObject(propertys,"Document");                   //Get filtered Documents
                    if(documentadapter.filter(MMDAobj,filter))
                    {
                        outputobjects.addObject(MMDAobj);                        //filter object
                    }
                }
                else
                {
                    console.log("Got Document which is not instance of projects.Document");
                }
            });
            outputobjects = outputobjects.sort(qrysortcolumns);         //Sort Objects
            outputobjects.returnResult(qryresulttype,filename);       //Return As Output Type
            console.log("Im Done!!!");
        })
    }

    public getModuleDocumentsAsTXT(modulename : string, propertys : string[], filter : Filter[], sortcolumn : string[], filename : string) {
        this.getModuleDocuments(modulename, propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    }

    public getModuleDocumentsAsHTML(modulename : string, propertys : string[], filter : Filter[], sortcolumn : string[], filename : string) {
        this.getModuleDocuments(modulename, propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    }

    public getModuleDocumentsAsXML(modulename : string, propertys : string[], filter : Filter[], sortcolumn : string[], filename : string) {
        this.getModuleDocuments(modulename, propertys, filter, sortcolumn, MMDAProject.XML, filename);
    }

    public getModuleDocumentsAsJSON(modulename : string, propertys : string[], filter : Filter[], sortcolumn : string[], filename : string) {
        this.getModuleDocuments(modulename, propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    }

    protected getFolderDocuments(foldername : string, qrypropertys : string[], filter : Filter[], qrysortcolumns : string[], qryresulttype : string, filename: string) {
        var outputobjects : MMDAO.OutputObjectList = new MMDAO.OutputObjectList();
        var folderfound : boolean = false;
        this.project.createWorkingCopy().then((workingCopy) => {
            return workingCopy.model().allFolders();
        })
        .done((folders) => {
            folders.forEach((folder) => {
                if(folder.name == foldername)
                {
                    folderfound = true;
                    folder.documents.forEach((doc) => {
                        if(doc instanceof projects.Document){
                            var documentadapter : MMDAA.DocumentAdapter = new MMDAA.DocumentAdapter();
                            var propertys : MMDAO.OutputObjectProperty[] = new Array();
                            var MMDAobj : MMDAO.OutputObject;
                            propertys = documentadapter.getDocumentPropertys(doc, qrypropertys);
                            MMDAobj = new MMDAO.OutputObject(propertys,"Document");                   //Get filtered Documents
                            if(documentadapter.filter(MMDAobj,filter))
                            {
                                outputobjects.addObject(MMDAobj);                        //filter object
                            }
                        }
                        else
                        {
                            console.log("Got Document which is not instance of projects.Document");
                        }
                    });
                    outputobjects = outputobjects.sort(qrysortcolumns);         //Sort Objects
                    outputobjects.returnResult(qryresulttype,filename);       //Return As Output Type
                    console.log("Im Done!!!");
                }
            })
            if(!folderfound){
                fs.outputFile(filename, "Ordner mit dem Namen " + foldername + " wurde nicht gefunden");
            }
        })
    }

    public getFolderDocumentsAsHTML(foldername : string, propertys : string[], filter : Filter[], sortcolumn : string[], filename : string) {
        this.getFolderDocuments(foldername, propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    }

    public getFolderDocumentsAsTXT(foldername : string, propertys : string[], filter : Filter[], sortcolumn : string[], filename : string) {
        this.getFolderDocuments(foldername, propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    }

    public getFolderDocumentsAsXML(foldername : string, propertys : string[], filter : Filter[], sortcolumn : string[], filename : string) {
        this.getFolderDocuments(foldername, propertys, filter, sortcolumn, MMDAProject.XML, filename);
    }

    public getFolderDocumentsAsJSON(foldername : string, propertys : string[], filter : Filter[], sortcolumn : string[], filename : string) {
        this.getFolderDocuments(foldername, propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    }

    protected loadAllDocumentsAsPromise(documents: projects.IDocument[]): when.Promise<projects.Document[]> {
        return when.all<projects.Document[]>(documents.map( doc => loadAsPromise(doc)));
    }

    
}    

export class Filter {
    private filtertype : string;
    private filtervalue : string;

    public constructor(filtertype : string, filtervalue : string){
        this.filtertype = filtertype;
        this.filtervalue = filtervalue;
    }

    public getType() {
        return this.filtertype;
    }

    public getValue() {
        return this.filtervalue;
    }
}

