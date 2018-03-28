import {ModelSdkClient, IModel, IModelUnit, domainmodels, utils, pages, customwidgets, projects, documenttemplates, constants, enumerations, images, microflows, regularexpressions} from "mendixmodelsdk";
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

    protected traverseFoldersForDocuments(folders : projects.IFolder[]) : projects.IDocument[] {
        var documents : projects.IDocument[] = new Array();
        folders.forEach((folder) => {
            folder.documents.forEach((doc) => {
                documents[documents.length] = doc;
            })
            var subdocuments : projects.IDocument[] = new Array();
            subdocuments = this.traverseFoldersForDocuments(folder.folders)
            subdocuments.forEach((subdoc) => {
                documents[documents.length] = subdoc;
            })
        })
        return documents;
    }

    protected traverseFoldersForFolders(folders : projects.IFolder[]) : projects.IFolder[] {
        var foundfolders : projects.IFolder[] = new Array();
        folders.forEach((folder) => {
            foundfolders[foundfolders.length] = folder;
            var subfolders : projects.IFolder[] = new Array();
            subfolders = this.traverseFoldersForFolders(folder.folders)
            subfolders.forEach((subfold) => {
                foundfolders[foundfolders.length] = subfold;
            })
        })
        return foundfolders;
    }

    protected returnDocuments(documents : projects.Document[],qrypropertys : string[], filter : Filter[], qrysortcolumns : Sorter[], qryresulttype : string, filename: string)
    {
        var outputobjects : MMDAO.OutputObjectList = new MMDAO.OutputObjectList();

        documents.forEach((doc) => {
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

    /*
    Gets Documents from whole Project
    Parameter: qrypropertys : string[]      Array of property constants of wanted propertys
    Parameter: qryfiltertypes : string[]    Array of filter constants of propertys to filter
    Parameter: qryfiltervalues : string[]   Array of Values for the filters
    Parameter: qrysortcolumns : number[]    Array of Columnnumbers for sorting
    Parameter: qryresulttype : string       Constant which ResultType should be used
    */
    protected getProjectDocuments(qrypropertys : string[], filter : Filter[], qrysortcolumns : Sorter[], qryresulttype : string, filename: string) {
        this.project.createWorkingCopy().then((workingCopy) => {
            return workingCopy.model().allDocuments();
        })
        .then((documents) => { 
            return this.loadAllDocumentsAsPromise(documents);
        })
        .done((loadeddocs) => {
            this.returnDocuments(loadeddocs, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
        });
    }

    public getProjectDocumentsAsHTML(propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getProjectDocuments(propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    }

    public getProjectDocumentsAsXML(propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getProjectDocuments(propertys, filter, sortcolumn, MMDAProject.XML, filename);
    }

    public getProjectDocumentsAsTXT(propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getProjectDocuments(propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    }

    public getProjectDocumentsAsJSON(propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getProjectDocuments(propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    }

    protected getModuleDocuments(modulename : string, qrypropertys : string[], filter : Filter[], qrysortcolumns : Sorter[], qryresulttype : string, filename: string) {
        this.project.createWorkingCopy().then((workingCopy) => {
            return workingCopy.model().findModuleByQualifiedName(modulename);
        })
        .then((modul) => {
            var documents : projects.IDocument[];
            documents = this.traverseFoldersForDocuments(modul.folders);
            modul.documents.forEach((doc) => {
                documents[documents.length] = doc;
            })
            return this.loadAllDocumentsAsPromise(documents);
        })
        .done((loadeddocs) => {
            this.returnDocuments(loadeddocs, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
        })
    }

    public getModuleDocumentsAsTXT(modulename : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getModuleDocuments(modulename, propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    }

    public getModuleDocumentsAsHTML(modulename : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getModuleDocuments(modulename, propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    }

    public getModuleDocumentsAsXML(modulename : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getModuleDocuments(modulename, propertys, filter, sortcolumn, MMDAProject.XML, filename);
    }

    public getModuleDocumentsAsJSON(modulename : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getModuleDocuments(modulename, propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    }

    protected getFolderDocuments(foldername : string, qrypropertys : string[], filter : Filter[], qrysortcolumns : Sorter[], qryresulttype : string, filename: string) {
        var folderfound : boolean = false;
        var searchedfolder : projects.IFolder;
        this.project.createWorkingCopy().then((workingCopy) => {
            return workingCopy.model().allFolders();
        })
        .then((folders) => {
            folders.forEach((folder) => {
                if(folder.name == foldername)
                {
                    folderfound = true;
                    searchedfolder = folder;
                }
            })
            if(!folderfound){
                fs.outputFile(filename, "Ordner mit dem Namen " + foldername + " wurde nicht gefunden");
            }
            var documents : projects.IDocument[];
            documents = this.traverseFoldersForDocuments(searchedfolder.folders);
            searchedfolder.documents.forEach((doc) => {
                documents[documents.length] = doc;
            })
            return this.loadAllDocumentsAsPromise(documents);
        })
        .done((loadeddocs) => {
            this.returnDocuments(loadeddocs, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
        })
    }

    public getFolderDocumentsAsHTML(foldername : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getFolderDocuments(foldername, propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    }

    public getFolderDocumentsAsTXT(foldername : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getFolderDocuments(foldername, propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    }

    public getFolderDocumentsAsXML(foldername : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getFolderDocuments(foldername, propertys, filter, sortcolumn, MMDAProject.XML, filename);
    }

    public getFolderDocumentsAsJSON(foldername : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getFolderDocuments(foldername, propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    }

    protected loadAllDocumentsAsPromise(documents: projects.IDocument[]): when.Promise<projects.Document[]> {
        return when.all<projects.Document[]>(documents.map( doc => loadAsPromise(doc)));
    }

    protected returnDomainModels(domainmods : domainmodels.DomainModel[],qrypropertys : string[], filter : Filter[], qrysortcolumns : Sorter[], qryresulttype : string, filename: string) {
        var outputobjects : MMDAO.OutputObjectList = new MMDAO.OutputObjectList();
        domainmods.forEach((dm) => {
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
    }

    protected getProjectDomainModels(qrypropertys : string[], filter : Filter[], qrysortcolumns : Sorter[], qryresulttype : string, filename: string) {
        this.project.createWorkingCopy().then((workingCopy) => {
            return workingCopy.model().allDomainModels();
        })
        .then((domainmodels) => { 
            return this.loadAllDomainModelsAsPromise(domainmodels);
        })
        .done((loadeddms) => {
            this.returnDomainModels(loadeddms, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
        });
    }

    public getProjectDomainModelsAsHTML(propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getProjectDomainModels(propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    }

    public getProjectDomainModelsAsXML(propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getProjectDomainModels(propertys, filter, sortcolumn, MMDAProject.XML, filename);
    }

    public getProjectDomainModelsAsTXT(propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getProjectDomainModels(propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    }

    public getProjectDomainModelsAsJSON(propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getProjectDomainModels(propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    }

    protected getModuleDomainModels(modulename : string, qrypropertys : string[], filter : Filter[], qrysortcolumns : Sorter[], qryresulttype : string, filename: string) {
        this.project.createWorkingCopy().then((workingCopy) => {
            return workingCopy.model().findModuleByQualifiedName(modulename);
        })
        .then((modul) => {
            return this.loadAllDomainModelsAsPromise([modul.domainModel]);
        })
        .done((loadeddomainmodels) => {
            this.returnDomainModels(loadeddomainmodels, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
        })
    }

    public getModuleDomainModelsAsTXT(modulename : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getModuleDomainModels(modulename, propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    }

    public getModuleDomainModelsAsHTML(modulename : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getModuleDomainModels(modulename, propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    }

    public getModuleDomainModelsAsXML(modulename : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getModuleDomainModels(modulename, propertys, filter, sortcolumn, MMDAProject.XML, filename);
    }

    public getModuleDomainModelsAsJSON(modulename : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getModuleDomainModels(modulename, propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    }

    protected loadAllDomainModelsAsPromise(domainmodels: domainmodels.IDomainModel[]): when.Promise<domainmodels.DomainModel[]> {
        return when.all<domainmodels.DomainModel[]>(domainmodels.map( dm => loadAsPromise(dm)));
    }

    protected returnConstants(loadedcons : constants.Constant[], qrypropertys : string[], filter : Filter[], qrysortcolumns : Sorter[], qryresulttype : string, filename: string) {
        var outputobjects : MMDAO.OutputObjectList = new MMDAO.OutputObjectList();
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
    }

    protected getProjectConstants(qrypropertys : string[], filter : Filter[], qrysortcolumns : Sorter[], qryresulttype : string, filename: string) {
        this.project.createWorkingCopy().then((workingCopy) => {
            return workingCopy.model().allConstants();
        })
        .then((constants) => { 
            return this.loadAllConstantsAsPromise(constants);
        })
        .done((loadedcons) => {
            this.returnConstants(loadedcons, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
        });
    }

    public getProjectConstantsAsHTML(propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getProjectConstants(propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    }

    public getProjectConstantsAsXML(propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getProjectConstants(propertys, filter, sortcolumn, MMDAProject.XML, filename);
    }

    public getProjectConstantsAsTXT(propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getProjectConstants(propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    }

    public getProjectConstantsAsJSON(propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getProjectConstants(propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    }

    protected getModuleConstants(modulename : string, qrypropertys : string[], filter : Filter[], qrysortcolumns : Sorter[], qryresulttype : string, filename: string) {
        this.project.createWorkingCopy().then((workingCopy) => {
            return workingCopy.model().findModuleByQualifiedName(modulename);
        })
        .then((modul) => {
            var documents : projects.IDocument[];
            documents = this.traverseFoldersForDocuments(modul.folders);
            modul.documents.forEach((doc) => {
                documents[documents.length] = doc;
            })
            var cons : constants.IConstant[] = new Array();
            documents.forEach((doc) => {
                if(doc instanceof constants.Constant)
                {
                    cons[cons.length] = doc;
                }
            })
            return this.loadAllConstantsAsPromise(cons);
        })
        .done((loadedcons) => {
            this.returnConstants(loadedcons, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
        })
    }

    public getModuleConstantsAsTXT(modulename : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getModuleConstants(modulename, propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    }

    public getModuleConstantsAsHTML(modulename : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getModuleConstants(modulename, propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    }

    public getModuleConstantsAsXML(modulename : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getModuleConstants(modulename, propertys, filter, sortcolumn, MMDAProject.XML, filename);
    }

    public getModuleConstantsAsJSON(modulename : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getModuleConstants(modulename, propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    }

    protected getFolderConstants(foldername : string, qrypropertys : string[], filter : Filter[], qrysortcolumns : Sorter[], qryresulttype : string, filename: string) {
        var folderfound : boolean = false;
        var searchedfolder : projects.IFolder;
        this.project.createWorkingCopy().then((workingCopy) => {
            return workingCopy.model().allFolders();
        })
        .then((folders) => {
            folders.forEach((folder) => {
                if(folder.name == foldername)
                {
                    folderfound = true;
                    searchedfolder = folder;
                }
            })
            if(!folderfound){
                fs.outputFile(filename, "Ordner mit dem Namen " + foldername + " wurde nicht gefunden");
            }
            var documents : projects.IDocument[] = new Array();
            documents = this.traverseFoldersForDocuments(searchedfolder.folders);
            searchedfolder.documents.forEach((doc) => {
                documents[documents.length] = doc;
            })
            var cons : constants.IConstant[] = new Array();
            documents.forEach((doc) => {
                if(doc instanceof constants.Constant)
                {
                    cons[cons.length] = doc;
                }
            })
            return this.loadAllConstantsAsPromise(cons);
        })
        .done((loadedcons) => {
            this.returnConstants(loadedcons, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
        })
    }

    public getFolderConstantsAsHTML(foldername : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getFolderConstants(foldername, propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    }

    public getFolderConstantsAsTXT(foldername : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getFolderConstants(foldername, propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    }

    public getFolderConstantsAsXML(foldername : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getFolderConstants(foldername, propertys, filter, sortcolumn, MMDAProject.XML, filename);
    }

    public getFolderConstantsAsJSON(foldername : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getFolderConstants(foldername, propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    }

    protected loadAllConstantsAsPromise(constants: constants.IConstant[]): when.Promise<constants.Constant[]> {
        return when.all<constants.Constant[]>(constants.map( con => loadAsPromise(con)));
    }

    protected returnEnumerations(loadedenums : enumerations.Enumeration[], qrypropertys : string[], filter : Filter[], qrysortcolumns : Sorter[], qryresulttype : string, filename: string) {
        var outputobjects : MMDAO.OutputObjectList = new MMDAO.OutputObjectList();
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
    }

    protected getProjectEnumerations(qrypropertys : string[], filter : Filter[], qrysortcolumns : Sorter[], qryresulttype : string, filename: string) {
        
        this.project.createWorkingCopy().then((workingCopy) => {
            return workingCopy.model().allEnumerations();
        })
        .then((enumerations) => { 
            return this.loadAllEnumerationsAsPromise(enumerations);
        })
        .done((loadedenums) => {
            this.returnEnumerations(loadedenums, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
        });
    }

    public getProjectEnumerationsAsHTML(propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getProjectEnumerations(propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    }

    public getProjectEnumerationsAsXML(propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getProjectEnumerations(propertys, filter, sortcolumn, MMDAProject.XML, filename);
    }

    public getProjectEnumerationsAsTXT(propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getProjectEnumerations(propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    }

    public getProjectEnumerationsAsJSON(propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getProjectEnumerations(propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    }

    protected getModuleEnumerations(modulename : string, qrypropertys : string[], filter : Filter[], qrysortcolumns : Sorter[], qryresulttype : string, filename: string) {
        this.project.createWorkingCopy().then((workingCopy) => {
            return workingCopy.model().findModuleByQualifiedName(modulename);
        })
        .then((modul) => {
            var documents : projects.IDocument[];
            documents = this.traverseFoldersForDocuments(modul.folders);
            modul.documents.forEach((doc) => {
                documents[documents.length] = doc;
            })
            var enums : enumerations.IEnumeration[] = new Array();
            documents.forEach((doc) => {
                if(doc instanceof enumerations.Enumeration)
                {
                    enums[enums.length] = doc;
                }
            })
            return this.loadAllEnumerationsAsPromise(enums);
        })
        .done((loadedenums) => {
            this.returnEnumerations(loadedenums, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
        })
    }

    public getModuleEnumerationsAsTXT(modulename : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getModuleEnumerations(modulename, propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    }

    public getModuleEnumerationsAsHTML(modulename : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getModuleEnumerations(modulename, propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    }

    public getModuleEnumerationsAsXML(modulename : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getModuleEnumerations(modulename, propertys, filter, sortcolumn, MMDAProject.XML, filename);
    }

    public getModuleEnumerationsAsJSON(modulename : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getModuleEnumerations(modulename, propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    }

    protected getFolderEnumerations(foldername : string, qrypropertys : string[], filter : Filter[], qrysortcolumns : Sorter[], qryresulttype : string, filename: string) {
        var folderfound : boolean = false;
        var searchedfolder : projects.IFolder;
        this.project.createWorkingCopy().then((workingCopy) => {
            return workingCopy.model().allFolders();
        })
        .then((folders) => {
            folders.forEach((folder) => {
                if(folder.name == foldername)
                {
                    folderfound = true;
                    searchedfolder = folder;
                }
            })
            if(!folderfound){
                fs.outputFile(filename, "Ordner mit dem Namen " + foldername + " wurde nicht gefunden");
            }
            var documents : projects.IDocument[] = new Array();
            documents = this.traverseFoldersForDocuments(searchedfolder.folders);
            searchedfolder.documents.forEach((doc) => {
                documents[documents.length] = doc;
            })
            var enums : enumerations.IEnumeration[] = new Array();
            documents.forEach((doc) => {
                if(doc instanceof enumerations.Enumeration)
                {
                    enums[enums.length] = doc;
                }
            })
            return this.loadAllEnumerationsAsPromise(enums);
        })
        .done((loadedenums) => {
            this.returnEnumerations(loadedenums, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
        })
    }

    public getFolderEnumerationsAsHTML(foldername : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getFolderEnumerations(foldername, propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    }

    public getFolderEnumerationsAsTXT(foldername : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getFolderEnumerations(foldername, propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    }

    public getFolderEnumerationsAsXML(foldername : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getFolderEnumerations(foldername, propertys, filter, sortcolumn, MMDAProject.XML, filename);
    }

    public getFolderEnumerationsAsJSON(foldername : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getFolderEnumerations(foldername, propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    }

    protected loadAllEnumerationsAsPromise(enumerations: enumerations.IEnumeration[]): when.Promise<enumerations.Enumeration[]> {
        return when.all<enumerations.Enumeration[]>(enumerations.map( num => loadAsPromise(num)));
    }

    protected returnImageCollections(loadedimgcol : images.ImageCollection[], qrypropertys : string[], filter : Filter[], qrysortcolumns : Sorter[], qryresulttype : string, filename: string) {
        var outputobjects : MMDAO.OutputObjectList = new MMDAO.OutputObjectList();
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
    }

    protected getProjectImageCollections(qrypropertys : string[], filter : Filter[], qrysortcolumns : Sorter[], qryresulttype : string, filename: string) {
        this.project.createWorkingCopy().then((workingCopy) => {
            return workingCopy.model().allImageCollections();
        })
        .then((imagecollections) => { 
            return this.loadAllImageCollectionsAsPromise(imagecollections);
        })
        .done((loadedimgcol) => {
            this.returnImageCollections(loadedimgcol, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
        });
    }

    public getProjectImageCollectionsAsHTML(propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getProjectImageCollections(propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    }

    public getProjectImageCollectionsAsXML(propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getProjectImageCollections(propertys, filter, sortcolumn, MMDAProject.XML, filename);
    }

    public getProjectImageCollectionsAsTXT(propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getProjectImageCollections(propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    }

    public getProjectImageCollectionsAsJSON(propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getProjectImageCollections(propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    }

    protected getModuleImageCollections(modulename : string, qrypropertys : string[], filter : Filter[], qrysortcolumns : Sorter[], qryresulttype : string, filename: string) {
        this.project.createWorkingCopy().then((workingCopy) => {
            return workingCopy.model().findModuleByQualifiedName(modulename);
        })
        .then((modul) => {
            var documents : projects.IDocument[];
            documents = this.traverseFoldersForDocuments(modul.folders);
            modul.documents.forEach((doc) => {
                documents[documents.length] = doc;
            })
            var imgcols : images.IImageCollection[] = new Array();
            documents.forEach((doc) => {
                if(doc instanceof images.ImageCollection)
                {
                    imgcols[imgcols.length] = doc;
                }
            })
            return this.loadAllImageCollectionsAsPromise(imgcols);
        })
        .done((loadedimgcols) => {
            this.returnImageCollections(loadedimgcols, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
        })
    }

    public getModuleImageCollectionsAsTXT(modulename : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getModuleImageCollections(modulename, propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    }

    public getModuleImageCollectionsAsHTML(modulename : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getModuleImageCollections(modulename, propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    }

    public getModuleImageCollectionsAsXML(modulename : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getModuleImageCollections(modulename, propertys, filter, sortcolumn, MMDAProject.XML, filename);
    }

    public getModuleImageCollectionsAsJSON(modulename : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getModuleImageCollections(modulename, propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    }

    protected getFolderImageCollections(foldername : string, qrypropertys : string[], filter : Filter[], qrysortcolumns : Sorter[], qryresulttype : string, filename: string) {
        var folderfound : boolean = false;
        var searchedfolder : projects.IFolder;
        this.project.createWorkingCopy().then((workingCopy) => {
            return workingCopy.model().allFolders();
        })
        .then((folders) => {
            folders.forEach((folder) => {
                if(folder.name == foldername)
                {
                    folderfound = true;
                    searchedfolder = folder;
                }
            })
            if(!folderfound){
                fs.outputFile(filename, "Ordner mit dem Namen " + foldername + " wurde nicht gefunden");
            }
            var documents : projects.IDocument[] = new Array();
            documents = this.traverseFoldersForDocuments(searchedfolder.folders);
            searchedfolder.documents.forEach((doc) => {
                documents[documents.length] = doc;
            })
            var imgcols : images.IImageCollection[] = new Array();
            documents.forEach((doc) => {
                if(doc instanceof images.ImageCollection)
                {
                    imgcols[imgcols.length] = doc;
                }
            })
            return this.loadAllImageCollectionsAsPromise(imgcols);
        })
        .done((loadedimgcols) => {
            this.returnImageCollections(loadedimgcols, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
        })
    }

    public getFolderImageCollectionsAsHTML(foldername : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getFolderImageCollections(foldername, propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    }

    public getFolderImageCollectionsAsTXT(foldername : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getFolderImageCollections(foldername, propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    }

    public getFolderImageCollectionsAsXML(foldername : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getFolderImageCollections(foldername, propertys, filter, sortcolumn, MMDAProject.XML, filename);
    }

    public getFolderImageCollectionsAsJSON(foldername : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getFolderImageCollections(foldername, propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    }

    protected loadAllImageCollectionsAsPromise(imagecollections : images.IImageCollection[]): when.Promise<images.ImageCollection[]> {
        return when.all<images.ImageCollection[]>(imagecollections.map( img => loadAsPromise(img)));
    }

    protected returnFolders(loadedfolders : projects.IFolder[], qrypropertys : string[], filter : Filter[], qrysortcolumns : Sorter[], qryresulttype : string, filename: string) {
        var outputobjects : MMDAO.OutputObjectList = new MMDAO.OutputObjectList();
        loadedfolders.forEach((folder) => {
            if(folder instanceof projects.Folder){
                var folderadapter : MMDAA.FolderAdapter = new MMDAA.FolderAdapter();
                var propertys : MMDAO.OutputObjectProperty[] = new Array();
                var MMDAobj : MMDAO.OutputObject;
                propertys = folderadapter.getFolderPropertys(folder, qrypropertys);
                MMDAobj = new MMDAO.OutputObject(propertys,"Folder");                   //Get filtered Documents
                if(folderadapter.filter(MMDAobj,filter))
                {
                    outputobjects.addObject(MMDAobj);                        //filter object
                }
            }
            else
            {
                console.log("Got Folder which is not instance of projects.Folder");
            }
        });
        outputobjects = outputobjects.sort(qrysortcolumns);         //Sort Objects
        outputobjects.returnResult(qryresulttype,filename);       //Return As Output Type
        console.log("Im Done!!!");
    }

    protected getProjectFolders(qrypropertys : string[], filter : Filter[], qrysortcolumns : Sorter[], qryresulttype : string, filename: string) {
        this.project.createWorkingCopy().then((workingCopy) => {
            return workingCopy.model().allFolders();
        })
        .then((folders) => { 
            return folders;
        })
        .done((loadedfolders) => {
            this.returnFolders(loadedfolders, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
        });
    }

    public getProjectFoldersAsHTML(propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getProjectFolders(propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    }

    public getProjectFoldersAsXML(propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getProjectFolders(propertys, filter, sortcolumn, MMDAProject.XML, filename);
    }

    public getProjectFoldersAsTXT(propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getProjectFolders(propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    }

    public getProjectFoldersAsJSON(propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getProjectFolders(propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    }

    protected getModuleFolders(modulename : string, qrypropertys : string[], filter : Filter[], qrysortcolumns : Sorter[], qryresulttype : string, filename: string) {
        this.project.createWorkingCopy().then((workingCopy) => {
            return workingCopy.model().findModuleByQualifiedName(modulename);
        })
        .then((modul) => {
            var folders : projects.IFolder[];
            folders = this.traverseFoldersForFolders(modul.folders);
            return folders;
        })
        .done((loadedfolders) => {
            this.returnFolders(loadedfolders, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
        })
    }

    public getModuleFoldersAsTXT(modulename : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getModuleFolders(modulename, propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    }

    public getModuleFoldersAsHTML(modulename : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getModuleFolders(modulename, propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    }

    public getModuleFoldersAsXML(modulename : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getModuleFolders(modulename, propertys, filter, sortcolumn, MMDAProject.XML, filename);
    }

    public getModuleFoldersAsJSON(modulename : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getModuleFolders(modulename, propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    }

    protected getFolderFolders(foldername : string, qrypropertys : string[], filter : Filter[], qrysortcolumns : Sorter[], qryresulttype : string, filename: string) {
        var folderfound : boolean = false;
        var searchedfolder : projects.IFolder;
        this.project.createWorkingCopy().then((workingCopy) => {
            return workingCopy.model().allFolders();
        })
        .then((folders) => {
            folders.forEach((folder) => {
                if(folder.name == foldername)
                {
                    folderfound = true;
                    searchedfolder = folder;
                }
            })
            if(!folderfound){
                fs.outputFile(filename, "Ordner mit dem Namen " + foldername + " wurde nicht gefunden");
            }
            var folders : projects.IFolder[];
            folders = this.traverseFoldersForFolders(searchedfolder.folders);
            return folders;
        })
        .done((loadedfolders) => {
            this.returnFolders(loadedfolders, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
        })
    }

    public getFolderFoldersAsHTML(foldername : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getFolderFolders(foldername, propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    }

    public getFolderFoldersAsTXT(foldername : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getFolderFolders(foldername, propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    }

    public getFolderFoldersAsXML(foldername : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getFolderFolders(foldername, propertys, filter, sortcolumn, MMDAProject.XML, filename);
    }

    public getFolderFoldersAsJSON(foldername : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getFolderFolders(foldername, propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    }

    protected returnLayouts(loadedlayouts : pages.Layout[], qrypropertys : string[], filter : Filter[], qrysortcolumns : Sorter[], qryresulttype : string, filename: string) {
        var outputobjects : MMDAO.OutputObjectList = new MMDAO.OutputObjectList();
        loadedlayouts.forEach((layout) => {
            if(layout instanceof pages.Layout){
                var layoutadapter : MMDAA.LayoutAdapter = new MMDAA.LayoutAdapter();
                var propertys : MMDAO.OutputObjectProperty[] = new Array();
                var MMDAobj : MMDAO.OutputObject;
                propertys = layoutadapter.getLayoutPropertys(layout, qrypropertys);
                MMDAobj = new MMDAO.OutputObject(propertys,"Layout");                   
                if(layoutadapter.filter(MMDAobj,filter))
                {
                    outputobjects.addObject(MMDAobj);                       
                }
            }
            else
            {
                console.log("Got Layout which is not instance of pages.Layout");
            }
        });
        outputobjects = outputobjects.sort(qrysortcolumns);         //Sort Objects
        outputobjects.returnResult(qryresulttype,filename);       //Return As Output Type
        console.log("Im Done!!!");
    }

    protected getProjectLayouts(qrypropertys : string[], filter : Filter[], qrysortcolumns : Sorter[], qryresulttype : string, filename: string) {
        this.project.createWorkingCopy().then((workingCopy) => {
            return workingCopy.model().allLayouts();
        })
        .then((layouts) => { 
            return this.loadAllLayoutsAsPromise(layouts);
        })
        .done((loadedlayouts) => {
            this.returnLayouts(loadedlayouts, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
        });
    }

    public getProjectLayoutsAsHTML(propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getProjectLayouts(propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    }

    public getProjectLayoutsAsXML(propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getProjectLayouts(propertys, filter, sortcolumn, MMDAProject.XML, filename);
    }

    public getProjectLayoutsAsTXT(propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getProjectLayouts(propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    }

    public getProjectLayoutsAsJSON(propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getProjectLayouts(propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    }

    protected getModuleLayouts(modulename : string, qrypropertys : string[], filter : Filter[], qrysortcolumns : Sorter[], qryresulttype : string, filename: string) {
        this.project.createWorkingCopy().then((workingCopy) => {
            return workingCopy.model().findModuleByQualifiedName(modulename);
        })
        .then((modul) => {
            var documents : projects.IDocument[];
            documents = this.traverseFoldersForDocuments(modul.folders);
            modul.documents.forEach((doc) => {
                documents[documents.length] = doc;
            })
            var lays : pages.ILayout[] = new Array();
            documents.forEach((doc) => {
                if(doc instanceof pages.Layout)
                {
                    lays[lays.length] = doc;
                }
            })
            return this.loadAllLayoutsAsPromise(lays);
        })
        .done((loadedlays) => {
            this.returnLayouts(loadedlays, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
        })
    }

    public getModuleLayoutsAsTXT(modulename : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getModuleLayouts(modulename, propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    }

    public getModuleLayoutsAsHTML(modulename : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getModuleLayouts(modulename, propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    }

    public getModuleLayoutsAsXML(modulename : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getModuleLayouts(modulename, propertys, filter, sortcolumn, MMDAProject.XML, filename);
    }

    public getModuleLayoutsAsJSON(modulename : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getModuleLayouts(modulename, propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    }

    protected getFolderLayouts(foldername : string, qrypropertys : string[], filter : Filter[], qrysortcolumns : Sorter[], qryresulttype : string, filename: string) {
        var folderfound : boolean = false;
        var searchedfolder : projects.IFolder;
        this.project.createWorkingCopy().then((workingCopy) => {
            return workingCopy.model().allFolders();
        })
        .then((folders) => {
            folders.forEach((folder) => {
                if(folder.name == foldername)
                {
                    folderfound = true;
                    searchedfolder = folder;
                }
            })
            if(!folderfound){
                fs.outputFile(filename, "Ordner mit dem Namen " + foldername + " wurde nicht gefunden");
            }
            var documents : projects.IDocument[] = new Array();
            documents = this.traverseFoldersForDocuments(searchedfolder.folders);
            searchedfolder.documents.forEach((doc) => {
                documents[documents.length] = doc;
            })
            var lays : pages.ILayout[] = new Array();
            documents.forEach((doc) => {
                if(doc instanceof pages.Layout)
                {
                    lays[lays.length] = doc;
                }
            })
            return this.loadAllLayoutsAsPromise(lays);
        })
        .done((loadedlays) => {
            this.returnLayouts(loadedlays, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
        })
    }

    public getFolderLayoutsAsHTML(foldername : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getFolderLayouts(foldername, propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    }

    public getFolderLayoutsAsTXT(foldername : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getFolderLayouts(foldername, propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    }

    public getFolderLayoutsAsXML(foldername : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getFolderLayouts(foldername, propertys, filter, sortcolumn, MMDAProject.XML, filename);
    }

    public getFolderLayoutsAsJSON(foldername : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getFolderLayouts(foldername, propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    }

    protected loadAllLayoutsAsPromise(layouts : pages.ILayout[]): when.Promise<pages.Layout[]> {
        return when.all<pages.Layout[]>(layouts.map( lay => loadAsPromise(lay)));
    }

    protected returnMicroflows(loadedmicroflows : microflows.Microflow[], qrypropertys : string[], filter : Filter[], qrysortcolumns : Sorter[], qryresulttype : string, filename: string) {
        var outputobjects : MMDAO.OutputObjectList = new MMDAO.OutputObjectList();
        loadedmicroflows.forEach((microflow) => {
            if(microflow instanceof microflows.Microflow){
                var microflowadapter : MMDAA.MicroflowAdapter = new MMDAA.MicroflowAdapter();
                var propertys : MMDAO.OutputObjectProperty[] = new Array();
                var MMDAobj : MMDAO.OutputObject;
                propertys = microflowadapter.getMicroflowPropertys(microflow, qrypropertys);
                MMDAobj = new MMDAO.OutputObject(propertys,"Microflow");                   
                if(microflowadapter.filter(MMDAobj,filter))
                {
                    outputobjects.addObject(MMDAobj);                       
                }
            }
            else
            {
                console.log("Got Microflow which is not instance of microflows.Microflow");
            }
        });
        outputobjects = outputobjects.sort(qrysortcolumns);         //Sort Objects
        outputobjects.returnResult(qryresulttype,filename);       //Return As Output Type
        console.log("Im Done!!!");
    }

    protected getProjectMicroflows(qrypropertys : string[], filter : Filter[], qrysortcolumns : Sorter[], qryresulttype : string, filename: string) {
        this.project.createWorkingCopy().then((workingCopy) => {
            return workingCopy.model().allMicroflows();
        })
        .then((microflows) => { 
            return this.loadAllMicroflowsAsPromise(microflows);
        })
        .done((loadedmicroflows) => {
            this.returnMicroflows(loadedmicroflows, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
        });
    }

    public getProjectMicroflowsAsHTML(propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getProjectMicroflows(propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    }

    public getProjectMicroflowsAsXML(propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getProjectMicroflows(propertys, filter, sortcolumn, MMDAProject.XML, filename);
    }

    public getProjectMicroflowsAsTXT(propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getProjectMicroflows(propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    }

    public getProjectMicroflowsAsJSON(propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getProjectMicroflows(propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    }

    protected getModuleMicroflows(modulename : string, qrypropertys : string[], filter : Filter[], qrysortcolumns : Sorter[], qryresulttype : string, filename: string) {
        this.project.createWorkingCopy().then((workingCopy) => {
            return workingCopy.model().findModuleByQualifiedName(modulename);
        })
        .then((modul) => {
            var documents : projects.IDocument[];
            documents = this.traverseFoldersForDocuments(modul.folders);
            modul.documents.forEach((doc) => {
                documents[documents.length] = doc;
            })
            var mfs : microflows.IMicroflow[] = new Array();
            documents.forEach((doc) => {
                if(doc instanceof microflows.Microflow)
                {
                    mfs[mfs.length] = doc;
                }
            })
            return this.loadAllMicroflowsAsPromise(mfs);
        })
        .done((loadedmfs) => {
            this.returnMicroflows(loadedmfs, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
        })
    }

    public getModuleMicroflowsAsTXT(modulename : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getModuleLayouts(modulename, propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    }

    public getModuleMicroflowsAsHTML(modulename : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getModuleMicroflows(modulename, propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    }

    public getModuleMicroflowsAsXML(modulename : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getModuleMicroflows(modulename, propertys, filter, sortcolumn, MMDAProject.XML, filename);
    }

    public getModuleMicroflowsAsJSON(modulename : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getModuleMicroflows(modulename, propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    }

    protected getFolderMicroflows(foldername : string, qrypropertys : string[], filter : Filter[], qrysortcolumns : Sorter[], qryresulttype : string, filename: string) {
        var folderfound : boolean = false;
        var searchedfolder : projects.IFolder;
        this.project.createWorkingCopy().then((workingCopy) => {
            return workingCopy.model().allFolders();
        })
        .then((folders) => {
            folders.forEach((folder) => {
                if(folder.name == foldername)
                {
                    folderfound = true;
                    searchedfolder = folder;
                }
            })
            if(!folderfound){
                fs.outputFile(filename, "Ordner mit dem Namen " + foldername + " wurde nicht gefunden");
            }
            var documents : projects.IDocument[] = new Array();
            documents = this.traverseFoldersForDocuments(searchedfolder.folders);
            searchedfolder.documents.forEach((doc) => {
                documents[documents.length] = doc;
            })
            var mfs : microflows.IMicroflow[] = new Array();
            documents.forEach((doc) => {
                if(doc instanceof microflows.Microflow)
                {
                    mfs[mfs.length] = doc;
                }
            })
            return this.loadAllMicroflowsAsPromise(mfs);
        })
        .done((loadedmfs) => {
            this.returnMicroflows(loadedmfs, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
        })
    }

    public getFolderMicroflowsAsHTML(foldername : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getFolderMicroflows(foldername, propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    }

    public getFolderMicroflowsAsTXT(foldername : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getFolderMicroflows(foldername, propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    }

    public getFolderMicroflowsAsXML(foldername : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getFolderMicroflows(foldername, propertys, filter, sortcolumn, MMDAProject.XML, filename);
    }

    public getFolderMicroflowsAsJSON(foldername : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getFolderMicroflows(foldername, propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    }

    protected loadAllMicroflowsAsPromise(microflows : microflows.IMicroflow[]): when.Promise<microflows.Microflow[]> {
        return when.all<microflows.Microflow[]>(microflows.map( mic => loadAsPromise(mic)));
    }

    protected returnModules(loadedmodules : projects.IModule[], qrypropertys : string[], filter : Filter[], qrysortcolumns : Sorter[], qryresulttype : string, filename: string) {
        var outputobjects : MMDAO.OutputObjectList = new MMDAO.OutputObjectList();
        loadedmodules.forEach((modul) => {
            if(modul instanceof projects.Module){
                var moduleadapter : MMDAA.ModuleAdapter = new MMDAA.ModuleAdapter();
                var propertys : MMDAO.OutputObjectProperty[] = new Array();
                var MMDAobj : MMDAO.OutputObject;
                propertys = moduleadapter.getModulePropertys(modul, qrypropertys);
                MMDAobj = new MMDAO.OutputObject(propertys,"Module");                   //Get filtered Documents
                if(moduleadapter.filter(MMDAobj,filter))
                {
                    outputobjects.addObject(MMDAobj);                        //filter object
                }
            }
            else
            {
                console.log("Got Module which is not instance of projects.Module");
            }
        });
        outputobjects = outputobjects.sort(qrysortcolumns);         //Sort Objects
        outputobjects.returnResult(qryresulttype,filename);       //Return As Output Type
        console.log("Im Done!!!");
    }

    protected getProjectModules(qrypropertys : string[], filter : Filter[], qrysortcolumns : Sorter[], qryresulttype : string, filename: string) {
        this.project.createWorkingCopy().then((workingCopy) => {
            return workingCopy.model().allModules();
        })
        .then((modules) => { 
            return modules;
        })
        .done((loadedmodules) => {
            this.returnModules(loadedmodules, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
        });
    }

    public getProjectModulesAsHTML(propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getProjectModules(propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    }

    public getProjectModulesAsXML(propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getProjectModules(propertys, filter, sortcolumn, MMDAProject.XML, filename);
    }

    public getProjectModulesAsTXT(propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getProjectModules(propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    }

    public getProjectModulesAsJSON(propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getProjectModules(propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    }

    protected returnPages(loadedpages : pages.Page[], qrypropertys : string[], filter : Filter[], qrysortcolumns : Sorter[], qryresulttype : string, filename: string) {
        var outputobjects : MMDAO.OutputObjectList = new MMDAO.OutputObjectList();
        loadedpages.forEach((page) => {
            if(page instanceof pages.Page){
                var pageadapter : MMDAA.PageAdapter = new MMDAA.PageAdapter();
                var propertys : MMDAO.OutputObjectProperty[] = new Array();
                var MMDAobj : MMDAO.OutputObject;
                propertys = pageadapter.getPagePropertys(page, qrypropertys);
                MMDAobj = new MMDAO.OutputObject(propertys,"Page");                   
                if(pageadapter.filter(MMDAobj,filter))
                {
                    outputobjects.addObject(MMDAobj);                       
                }
            }
            else
            {
                console.log("Got Page which is not instance of pages.Page");
            }
        });
        outputobjects = outputobjects.sort(qrysortcolumns);         //Sort Objects
        outputobjects.returnResult(qryresulttype,filename);       //Return As Output Type
        console.log("Im Done!!!");
    }

    protected getProjectPages(qrypropertys : string[], filter : Filter[], qrysortcolumns : Sorter[], qryresulttype : string, filename: string) {
        this.project.createWorkingCopy().then((workingCopy) => {
            return workingCopy.model().allPages();
        })
        .then((pages) => { 
            return this.loadAllPagesAsPromise(pages);
        })
        .done((loadedpages) => {
            this.returnPages(loadedpages, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
        });
    }

    public getProjectPagesAsHTML(propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getProjectPages(propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    }

    public getProjectPagesAsXML(propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getProjectPages(propertys, filter, sortcolumn, MMDAProject.XML, filename);
    }

    public getProjectPagesAsTXT(propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getProjectPages(propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    }

    public getProjectPagesAsJSON(propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getProjectPages(propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    }

    protected getModulePages(modulename : string, qrypropertys : string[], filter : Filter[], qrysortcolumns : Sorter[], qryresulttype : string, filename: string) {
        this.project.createWorkingCopy().then((workingCopy) => {
            return workingCopy.model().findModuleByQualifiedName(modulename);
        })
        .then((modul) => {
            var documents : projects.IDocument[];
            documents = this.traverseFoldersForDocuments(modul.folders);
            modul.documents.forEach((doc) => {
                documents[documents.length] = doc;
            })
            var pags : pages.IPage[] = new Array();
            documents.forEach((doc) => {
                if(doc instanceof pages.Page)
                {
                    pags[pags.length] = doc;
                }
            })
            return this.loadAllPagesAsPromise(pags);
        })
        .done((loadedpags) => {
            this.returnPages(loadedpags, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
        })
    }

    public getModulePagesAsTXT(modulename : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getModulePages(modulename, propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    }

    public getModulePagesAsHTML(modulename : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getModulePages(modulename, propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    }

    public getModulePagesAsXML(modulename : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getModulePages(modulename, propertys, filter, sortcolumn, MMDAProject.XML, filename);
    }

    public getModulePagesAsJSON(modulename : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getModulePages(modulename, propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    }

    protected getFolderPages(foldername : string, qrypropertys : string[], filter : Filter[], qrysortcolumns : Sorter[], qryresulttype : string, filename: string) {
        var folderfound : boolean = false;
        var searchedfolder : projects.IFolder;
        this.project.createWorkingCopy().then((workingCopy) => {
            return workingCopy.model().allFolders();
        })
        .then((folders) => {
            folders.forEach((folder) => {
                if(folder.name == foldername)
                {
                    folderfound = true;
                    searchedfolder = folder;
                }
            })
            if(!folderfound){
                fs.outputFile(filename, "Ordner mit dem Namen " + foldername + " wurde nicht gefunden");
            }
            var documents : projects.IDocument[] = new Array();
            documents = this.traverseFoldersForDocuments(searchedfolder.folders);
            searchedfolder.documents.forEach((doc) => {
                documents[documents.length] = doc;
            })
            var pags : pages.IPage[] = new Array();
            documents.forEach((doc) => {
                if(doc instanceof pages.Page)
                {
                    pags[pags.length] = doc;
                }
            })
            return this.loadAllPagesAsPromise(pags);
        })
        .done((loadedpags) => {
            this.returnPages(loadedpags, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
        })
    }

    public getFolderPagesAsHTML(foldername : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getFolderPages(foldername, propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    }

    public getFolderPagesAsTXT(foldername : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getFolderPages(foldername, propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    }

    public getFolderPagesAsXML(foldername : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getFolderPages(foldername, propertys, filter, sortcolumn, MMDAProject.XML, filename);
    }

    public getFolderPagesAsJSON(foldername : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getFolderPages(foldername, propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    }

    protected loadAllPagesAsPromise(pages : pages.IPage[]): when.Promise<pages.Page[]> {
        return when.all<pages.Page[]>(pages.map( page => loadAsPromise(page)));
    }

    protected returnRegularExpressions(loadedregexes : regularexpressions.RegularExpression[], qrypropertys : string[], filter : Filter[], qrysortcolumns : Sorter[], qryresulttype : string, filename: string) {
        var outputobjects : MMDAO.OutputObjectList = new MMDAO.OutputObjectList();
        loadedregexes.forEach((regex) => {
            if(regex instanceof regularexpressions.RegularExpression){
                var regexadapter : MMDAA.RegExAdapter = new MMDAA.RegExAdapter();
                var propertys : MMDAO.OutputObjectProperty[] = new Array();
                var MMDAobj : MMDAO.OutputObject;
                propertys = regexadapter.getRegExPropertys(regex, qrypropertys);
                MMDAobj = new MMDAO.OutputObject(propertys,"RegularExpression");                   
                if(regexadapter.filter(MMDAobj,filter))
                {
                    outputobjects.addObject(MMDAobj);                       
                }
            }
            else
            {
                console.log("Got RegularExpression which is not instance of regularexpressions.RegularExpression");
            }
        });
        outputobjects = outputobjects.sort(qrysortcolumns);         //Sort Objects
        outputobjects.returnResult(qryresulttype,filename);       //Return As Output Type
        console.log("Im Done!!!");
    }

    protected getProjectRegularExpressions(qrypropertys : string[], filter : Filter[], qrysortcolumns : Sorter[], qryresulttype : string, filename: string) {
        this.project.createWorkingCopy().then((workingCopy) => {
            return workingCopy.model().allRegularExpressions();
        })
        .then((regexes) => { 
            return this.loadAllRegularExpressionsAsPromise(regexes);
        })
        .done((loadedregexes) => {
            this.returnRegularExpressions(loadedregexes, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
        });
    }

    public getProjectRegularExpressionsAsHTML(propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getProjectRegularExpressions(propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    }

    public getProjectRegularExpressionsAsXML(propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getProjectRegularExpressions(propertys, filter, sortcolumn, MMDAProject.XML, filename);
    }

    public getProjectRegularExpressionsAsTXT(propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getProjectRegularExpressions(propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    }

    public getProjectRegularExpressionsAsJSON(propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getProjectRegularExpressions(propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    }

    protected getModuleRegularExpressions(modulename : string, qrypropertys : string[], filter : Filter[], qrysortcolumns : Sorter[], qryresulttype : string, filename: string) {
        this.project.createWorkingCopy().then((workingCopy) => {
            return workingCopy.model().findModuleByQualifiedName(modulename);
        })
        .then((modul) => {
            var documents : projects.IDocument[];
            documents = this.traverseFoldersForDocuments(modul.folders);
            modul.documents.forEach((doc) => {
                documents[documents.length] = doc;
            })
            var regexes : regularexpressions.IRegularExpression[] = new Array();
            documents.forEach((doc) => {
                if(doc instanceof regularexpressions.RegularExpression)
                {
                    regexes[regexes.length] = doc;
                }
            })
            return this.loadAllRegularExpressionsAsPromise(regexes);
        })
        .done((loadedregexes) => {
            this.returnRegularExpressions(loadedregexes, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
        })
    }

    public getModuleRegularExpressionsAsTXT(modulename : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getModuleRegularExpressions(modulename, propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    }

    public getModuleRegularExpressionsAsHTML(modulename : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getModuleRegularExpressions(modulename, propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    }

    public getModuleRegularExpressionsAsXML(modulename : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getModuleRegularExpressions(modulename, propertys, filter, sortcolumn, MMDAProject.XML, filename);
    }

    public getModuleRegularExpressionsAsJSON(modulename : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getModuleRegularExpressions(modulename, propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    }

    protected getFolderRegularExpressions(foldername : string, qrypropertys : string[], filter : Filter[], qrysortcolumns : Sorter[], qryresulttype : string, filename: string) {
        var folderfound : boolean = false;
        var searchedfolder : projects.IFolder;
        this.project.createWorkingCopy().then((workingCopy) => {
            return workingCopy.model().allFolders();
        })
        .then((folders) => {
            folders.forEach((folder) => {
                if(folder.name == foldername)
                {
                    folderfound = true;
                    searchedfolder = folder;
                }
            })
            if(!folderfound){
                fs.outputFile(filename, "Ordner mit dem Namen " + foldername + " wurde nicht gefunden");
            }
            var documents : projects.IDocument[] = new Array();
            documents = this.traverseFoldersForDocuments(searchedfolder.folders);
            searchedfolder.documents.forEach((doc) => {
                documents[documents.length] = doc;
            })
            var regexes : regularexpressions.IRegularExpression[] = new Array();
            documents.forEach((doc) => {
                if(doc instanceof regularexpressions.RegularExpression)
                {
                    regexes[regexes.length] = doc;
                }
            })
            return this.loadAllRegularExpressionsAsPromise(regexes);
        })
        .done((loadedregexes) => {
            this.returnRegularExpressions(loadedregexes, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
        })
    }

    public getFolderRegularExpressionsAsHTML(foldername : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getFolderRegularExpressions(foldername, propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    }

    public getFolderRegularExpressionsAsTXT(foldername : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getFolderRegularExpressions(foldername, propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    }

    public getFolderRegularExpressionsAsXML(foldername : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getFolderRegularExpressions(foldername, propertys, filter, sortcolumn, MMDAProject.XML, filename);
    }

    public getFolderRegularExpressionsAsJSON(foldername : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getFolderRegularExpressions(foldername, propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    }

    protected loadAllRegularExpressionsAsPromise(regex : regularexpressions.IRegularExpression[]): when.Promise<regularexpressions.RegularExpression[]> {
        return when.all<regularexpressions.RegularExpression[]>(regex.map( reg => loadAsPromise(reg)));
    }

    protected returnSnippets(loadedsnippets : pages.Snippet[], qrypropertys : string[], filter : Filter[], qrysortcolumns : Sorter[], qryresulttype : string, filename: string) {
        var outputobjects : MMDAO.OutputObjectList = new MMDAO.OutputObjectList();
        loadedsnippets.forEach((snippet) => {
            if(snippet instanceof pages.Snippet){
                var snippetadapter : MMDAA.SnippetAdapter = new MMDAA.SnippetAdapter();
                var propertys : MMDAO.OutputObjectProperty[] = new Array();
                var MMDAobj : MMDAO.OutputObject;
                propertys = snippetadapter.getSnippetPropertys(snippet, qrypropertys);
                MMDAobj = new MMDAO.OutputObject(propertys,"Snippet");                   
                if(snippetadapter.filter(MMDAobj,filter))
                {
                    outputobjects.addObject(MMDAobj);                       
                }
            }
            else
            {
                console.log("Got Snippet which is not instance of pages.Snippet");
            }
        });
        outputobjects = outputobjects.sort(qrysortcolumns);         //Sort Objects
        outputobjects.returnResult(qryresulttype,filename);       //Return As Output Type
        console.log("Im Done!!!");
    }

    protected getProjectSnippets(qrypropertys : string[], filter : Filter[], qrysortcolumns : Sorter[], qryresulttype : string, filename: string) {
        this.project.createWorkingCopy().then((workingCopy) => {
            return workingCopy.model().allSnippets();
        })
        .then((snippets) => { 
            return this.loadAllSnippetsAsPromise(snippets);
        })
        .done((loadedsnippets) => {
            this.returnSnippets(loadedsnippets, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
        });
    }

    public getProjectSnippetsAsHTML(propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getProjectSnippets(propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    }

    public getProjectSnippetsAsXML(propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getProjectSnippets(propertys, filter, sortcolumn, MMDAProject.XML, filename);
    }

    public getProjectSnippetsAsTXT(propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getProjectSnippets(propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    }

    public getProjectSnippetsAsJSON(propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getProjectSnippets(propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    }

    protected getModuleSnippets(modulename : string, qrypropertys : string[], filter : Filter[], qrysortcolumns : Sorter[], qryresulttype : string, filename: string) {
        this.project.createWorkingCopy().then((workingCopy) => {
            return workingCopy.model().findModuleByQualifiedName(modulename);
        })
        .then((modul) => {
            var documents : projects.IDocument[];
            documents = this.traverseFoldersForDocuments(modul.folders);
            modul.documents.forEach((doc) => {
                documents[documents.length] = doc;
            })
            var snips : pages.ISnippet[] = new Array();
            documents.forEach((doc) => {
                if(doc instanceof pages.Snippet)
                {
                    snips[snips.length] = doc;
                }
            })
            return this.loadAllSnippetsAsPromise(snips);
        })
        .done((loadedsnips) => {
            this.returnSnippets(loadedsnips, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
        })
    }

    public getModuleSnippetsAsTXT(modulename : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getModuleSnippets(modulename, propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    }

    public getModuleSnippetsAsHTML(modulename : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getModuleSnippets(modulename, propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    }

    public getModuleSnippetsAsXML(modulename : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getModuleSnippets(modulename, propertys, filter, sortcolumn, MMDAProject.XML, filename);
    }

    public getModuleSnippetsAsJSON(modulename : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getModuleSnippets(modulename, propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    }

    protected getFolderSnippets(foldername : string, qrypropertys : string[], filter : Filter[], qrysortcolumns : Sorter[], qryresulttype : string, filename: string) {
        var folderfound : boolean = false;
        var searchedfolder : projects.IFolder;
        this.project.createWorkingCopy().then((workingCopy) => {
            return workingCopy.model().allFolders();
        })
        .then((folders) => {
            folders.forEach((folder) => {
                if(folder.name == foldername)
                {
                    folderfound = true;
                    searchedfolder = folder;
                }
            })
            if(!folderfound){
                fs.outputFile(filename, "Ordner mit dem Namen " + foldername + " wurde nicht gefunden");
            }
            var documents : projects.IDocument[] = new Array();
            documents = this.traverseFoldersForDocuments(searchedfolder.folders);
            searchedfolder.documents.forEach((doc) => {
                documents[documents.length] = doc;
            })
            var snips : pages.ISnippet[] = new Array();
            documents.forEach((doc) => {
                if(doc instanceof pages.Snippet)
                {
                    snips[snips.length] = doc;
                }
            })
            return this.loadAllSnippetsAsPromise(snips);
        })
        .done((loadedsnips) => {
            this.returnSnippets(loadedsnips, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
        })
    }

    public getFolderSnippetsAsHTML(foldername : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getFolderSnippets(foldername, propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    }

    public getFolderSnippetsAsTXT(foldername : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getFolderSnippets(foldername, propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    }

    public getFolderSnippetsAsXML(foldername : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getFolderSnippets(foldername, propertys, filter, sortcolumn, MMDAProject.XML, filename);
    }

    public getFolderSnippetsAsJSON(foldername : string, propertys : string[], filter : Filter[], sortcolumn : Sorter[], filename : string) {
        this.getFolderSnippets(foldername, propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    }

    protected loadAllSnippetsAsPromise(snippet : pages.ISnippet[]): when.Promise<pages.Snippet[]> {
        return when.all<pages.Snippet[]>(snippet.map( snip => loadAsPromise(snip)));
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

export class Sorter {
    private sortertype : string;
    private isascending : boolean;

    public constructor(sortertype : string, isascending : boolean) {
        this.sortertype = sortertype;
        this.isascending = isascending;
    }

    public getType() {
        return this.sortertype;
    }

    public isAscending() {
        return this.isascending;
    }
}

