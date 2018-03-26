import {ModelSdkClient, IModel, IModelUnit, domainmodels, utils, pages, customwidgets, projects, documenttemplates, constants, enumerations, images} from "mendixmodelsdk";
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

    protected getProjectDomainModels(qrypropertys : string[], filter : Filter[], qrysortcolumns : string[], qryresulttype : string, filename: string) {
        var outputobjects : MMDAO.OutputObjectList = new MMDAO.OutputObjectList();
        this.project.createWorkingCopy().then((workingCopy) => {
            return workingCopy.model().allDomainModels();
        })
        .then((domainmodels) => { 
            return this.loadAllDomainModelsAsPromise(domainmodels);
        })
        .done((loadeddms) => {
            loadeddms.forEach((dm) => {
                if(dm instanceof domainmodels.DomainModel){
                    var domainmodeladapter : MMDAA.DomainModelAdapter = new MMDAA.DomainModelAdapter();
                    var propertys : MMDAO.OutputObjectProperty[] = new Array();
                    var MMDAobj : MMDAO.OutputObject;
                    propertys = domainmodeladapter.getDomainModelPropertys(dm, qrypropertys);
                    MMDAobj = new MMDAO.OutputObject(propertys,"DomainModel");                   //Get filtered Documents
                    if(domainmodeladapter.filter(MMDAobj,filter))
                    {
                        outputobjects.addObject(MMDAobj);                        //filter object
                    }
                }
                else
                {
                    console.log("Got Constant which is not instance of constants.Constant");
                }
            });
            outputobjects = outputobjects.sort(qrysortcolumns);         //Sort Objects
            outputobjects.returnResult(qryresulttype,filename);       //Return As Output Type
            console.log("Im Done!!!");
        });
    }

    public getProjectDomainModelsAsHTML(propertys : string[], filter : Filter[], sortcolumn : string[], filename : string) {
        this.getProjectDomainModels(propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    }

    public getProjectDomainModelsAsXML(propertys : string[], filter : Filter[], sortcolumn : string[], filename : string) {
        this.getProjectDomainModels(propertys, filter, sortcolumn, MMDAProject.XML, filename);
    }

    public getProjectDomainModelsAsTXT(propertys : string[], filter : Filter[], sortcolumn : string[], filename : string) {
        this.getProjectDomainModels(propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    }

    public getProjectDomainModelsAsJSON(propertys : string[], filter : Filter[], sortcolumn : string[], filename : string) {
        this.getProjectDomainModels(propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    }

    protected loadAllDomainModelsAsPromise(domainmodels: domainmodels.IDomainModel[]): when.Promise<domainmodels.DomainModel[]> {
        return when.all<domainmodels.DomainModel[]>(domainmodels.map( dm => loadAsPromise(dm)));
    }

    protected getProjectConstants(qrypropertys : string[], filter : Filter[], qrysortcolumns : string[], qryresulttype : string, filename: string) {
        var outputobjects : MMDAO.OutputObjectList = new MMDAO.OutputObjectList();
        this.project.createWorkingCopy().then((workingCopy) => {
            return workingCopy.model().allConstants();
        })
        .then((constants) => { 
            return this.loadAllConstantsAsPromise(constants);
        })
        .done((loadedcons) => {
            loadedcons.forEach((con) => {
                if(con instanceof constants.Constant){
                    var constantadapter : MMDAA.ConstantAdapter = new MMDAA.ConstantAdapter();
                    var propertys : MMDAO.OutputObjectProperty[] = new Array();
                    var MMDAobj : MMDAO.OutputObject;
                    propertys = constantadapter.getConstantPropertys(con, qrypropertys);
                    MMDAobj = new MMDAO.OutputObject(propertys,"Constant");                   //Get filtered Documents
                    if(constantadapter.filter(MMDAobj,filter))
                    {
                        outputobjects.addObject(MMDAobj);                        //filter object
                    }
                }
                else
                {
                    console.log("Got Constant which is not instance of constants.Constant");
                }
            });
            outputobjects = outputobjects.sort(qrysortcolumns);         //Sort Objects
            outputobjects.returnResult(qryresulttype,filename);       //Return As Output Type
            console.log("Im Done!!!");
        });
    }

    public getProjectConstantsAsHTML(propertys : string[], filter : Filter[], sortcolumn : string[], filename : string) {
        this.getProjectConstants(propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    }

    public getProjectConstantsAsXML(propertys : string[], filter : Filter[], sortcolumn : string[], filename : string) {
        this.getProjectConstants(propertys, filter, sortcolumn, MMDAProject.XML, filename);
    }

    public getProjectConstantsAsTXT(propertys : string[], filter : Filter[], sortcolumn : string[], filename : string) {
        this.getProjectConstants(propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    }

    public getProjectConstantsAsJSON(propertys : string[], filter : Filter[], sortcolumn : string[], filename : string) {
        this.getProjectConstants(propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    }

    protected loadAllConstantsAsPromise(constants: constants.IConstant[]): when.Promise<constants.Constant[]> {
        return when.all<constants.Constant[]>(constants.map( con => loadAsPromise(con)));
    }

    protected getProjectEnumerations(qrypropertys : string[], filter : Filter[], qrysortcolumns : string[], qryresulttype : string, filename: string) {
        var outputobjects : MMDAO.OutputObjectList = new MMDAO.OutputObjectList();
        this.project.createWorkingCopy().then((workingCopy) => {
            return workingCopy.model().allEnumerations();
        })
        .then((enumerations) => { 
            return this.loadAllEnumerationsAsPromise(enumerations);
        })
        .done((loadedenums) => {
            loadedenums.forEach((num) => {
                if(num instanceof enumerations.Enumeration){
                    var enumadapter : MMDAA.EnumerationAdapter = new MMDAA.EnumerationAdapter();
                    var propertys : MMDAO.OutputObjectProperty[] = new Array();
                    var MMDAobj : MMDAO.OutputObject;
                    propertys = enumadapter.getEnumerationPropertys(num, qrypropertys);
                    MMDAobj = new MMDAO.OutputObject(propertys,"Enumeration");                   //Get filtered Documents
                    if(enumadapter.filter(MMDAobj,filter))
                    {
                        outputobjects.addObject(MMDAobj);                        //filter object
                    }
                }
                else
                {
                    console.log("Got Enumeration which is not instance of enumerations.Enumeration");
                }
            });
            outputobjects = outputobjects.sort(qrysortcolumns);         //Sort Objects
            outputobjects.returnResult(qryresulttype,filename);       //Return As Output Type
            console.log("Im Done!!!");
        });
    }

    public getProjectEnumerationsAsHTML(propertys : string[], filter : Filter[], sortcolumn : string[], filename : string) {
        this.getProjectEnumerations(propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    }

    public getProjectEnumerationsAsXML(propertys : string[], filter : Filter[], sortcolumn : string[], filename : string) {
        this.getProjectEnumerations(propertys, filter, sortcolumn, MMDAProject.XML, filename);
    }

    public getProjectEnumerationsAsTXT(propertys : string[], filter : Filter[], sortcolumn : string[], filename : string) {
        this.getProjectEnumerations(propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    }

    public getProjectEnumerationsAsJSON(propertys : string[], filter : Filter[], sortcolumn : string[], filename : string) {
        this.getProjectEnumerations(propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    }

    protected loadAllEnumerationsAsPromise(enumerations: enumerations.IEnumeration[]): when.Promise<enumerations.Enumeration[]> {
        return when.all<enumerations.Enumeration[]>(enumerations.map( num => loadAsPromise(num)));
    }

    protected getProjectImageCollections(qrypropertys : string[], filter : Filter[], qrysortcolumns : string[], qryresulttype : string, filename: string) {
        var outputobjects : MMDAO.OutputObjectList = new MMDAO.OutputObjectList();
        this.project.createWorkingCopy().then((workingCopy) => {
            return workingCopy.model().allImageCollections();
        })
        .then((imagecollections) => { 
            return this.loadAllImageCollectionsAsPromise(imagecollections);
        })
        .done((loadedimgcol) => {
            loadedimgcol.forEach((imgcol) => {
                if(imgcol instanceof images.ImageCollection){
                    var imgcoladapter : MMDAA.ImageCollectionAdapter = new MMDAA.ImageCollectionAdapter();
                    var propertys : MMDAO.OutputObjectProperty[] = new Array();
                    var MMDAobj : MMDAO.OutputObject;
                    propertys = imgcoladapter.getImageCollectionPropertys(imgcol, qrypropertys);
                    MMDAobj = new MMDAO.OutputObject(propertys,"ImageCollection");                   //Get filtered Documents
                    if(imgcoladapter.filter(MMDAobj,filter))
                    {
                        outputobjects.addObject(MMDAobj);                        //filter object
                    }
                }
                else
                {
                    console.log("Got ImageCollection which is not instance of images.ImageCollection");
                }
            });
            outputobjects = outputobjects.sort(qrysortcolumns);         //Sort Objects
            outputobjects.returnResult(qryresulttype,filename);       //Return As Output Type
            console.log("Im Done!!!");
        });
    }

    public getProjectImageCollectionsAsHTML(propertys : string[], filter : Filter[], sortcolumn : string[], filename : string) {
        this.getProjectImageCollections(propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    }

    public getProjectImageCollectionsAsXML(propertys : string[], filter : Filter[], sortcolumn : string[], filename : string) {
        this.getProjectImageCollections(propertys, filter, sortcolumn, MMDAProject.XML, filename);
    }

    public getProjectImageCollectionsAsTXT(propertys : string[], filter : Filter[], sortcolumn : string[], filename : string) {
        this.getProjectImageCollections(propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    }

    public getProjectImageCollectionsAsJSON(propertys : string[], filter : Filter[], sortcolumn : string[], filename : string) {
        this.getProjectImageCollections(propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    }

    protected loadAllImageCollectionsAsPromise(imagecollections : images.IImageCollection[]): when.Promise<images.ImageCollection[]> {
        return when.all<images.ImageCollection[]>(imagecollections.map( img => loadAsPromise(img)));
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

