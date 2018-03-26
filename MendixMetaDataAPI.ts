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

    protected returnDocuments(documents : projects.Document[],qrypropertys : string[], filter : Filter[], qrysortcolumns : string[], qryresulttype : string, filename: string)
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
    protected getProjectDocuments(qrypropertys : string[], filter : Filter[], qrysortcolumns : string[], qryresulttype : string, filename: string) {
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
        this.project.createWorkingCopy().then((workingCopy) => {
            return workingCopy.model().findModuleByQualifiedName(modulename);
        })
        .then((modul) => {
            return this.loadAllDocumentsAsPromise(modul.documents);
        })
        .done((loadeddocs) => {
            this.returnDocuments(loadeddocs, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
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
            return this.loadAllDocumentsAsPromise(searchedfolder.documents);
        })
        .done((loadeddocs) => {
            this.returnDocuments(loadeddocs, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
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

    protected returnDomainModels(domainmods : domainmodels.DomainModel[],qrypropertys : string[], filter : Filter[], qrysortcolumns : string[], qryresulttype : string, filename: string) {
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

    protected getProjectDomainModels(qrypropertys : string[], filter : Filter[], qrysortcolumns : string[], qryresulttype : string, filename: string) {
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

    protected returnConstants(loadedcons : constants.Constant[], qrypropertys : string[], filter : Filter[], qrysortcolumns : string[], qryresulttype : string, filename: string) {
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

    protected getProjectConstants(qrypropertys : string[], filter : Filter[], qrysortcolumns : string[], qryresulttype : string, filename: string) {
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

    protected returnEnumerations(loadedenums : enumerations.Enumeration[], qrypropertys : string[], filter : Filter[], qrysortcolumns : string[], qryresulttype : string, filename: string) {
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

    protected getProjectEnumerations(qrypropertys : string[], filter : Filter[], qrysortcolumns : string[], qryresulttype : string, filename: string) {
        
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

    protected returnImageCollections(loadedimgcol : images.ImageCollection[], qrypropertys : string[], filter : Filter[], qrysortcolumns : string[], qryresulttype : string, filename: string) {
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

    protected getProjectImageCollections(qrypropertys : string[], filter : Filter[], qrysortcolumns : string[], qryresulttype : string, filename: string) {
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

    protected getProjectFolders(qrypropertys : string[], filter : Filter[], qrysortcolumns : string[], qryresulttype : string, filename: string) {
        var outputobjects : MMDAO.OutputObjectList = new MMDAO.OutputObjectList();
        this.project.createWorkingCopy().then((workingCopy) => {
            return workingCopy.model().allFolders();
        })
        .then((folders) => { 
            return folders;
        })
        .done((loadedfolders) => {
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
        });
    }

    public getProjectFoldersAsHTML(propertys : string[], filter : Filter[], sortcolumn : string[], filename : string) {
        this.getProjectFolders(propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    }

    public getProjectFoldersAsXML(propertys : string[], filter : Filter[], sortcolumn : string[], filename : string) {
        this.getProjectFolders(propertys, filter, sortcolumn, MMDAProject.XML, filename);
    }

    public getProjectFoldersAsTXT(propertys : string[], filter : Filter[], sortcolumn : string[], filename : string) {
        this.getProjectFolders(propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    }

    public getProjectFoldersAsJSON(propertys : string[], filter : Filter[], sortcolumn : string[], filename : string) {
        this.getProjectFolders(propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    }

    protected getProjectLayouts(qrypropertys : string[], filter : Filter[], qrysortcolumns : string[], qryresulttype : string, filename: string) {
        var outputobjects : MMDAO.OutputObjectList = new MMDAO.OutputObjectList();
        
        this.project.createWorkingCopy().then((workingCopy) => {
            return workingCopy.model().allLayouts();
        })
        .then((layouts) => { 
            return this.loadAllLayoutsAsPromise(layouts);
        })
        .done((loadedlayouts) => {
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
        });
    }

    public getProjectLayoutsAsHTML(propertys : string[], filter : Filter[], sortcolumn : string[], filename : string) {
        this.getProjectLayouts(propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    }

    public getProjectLayoutsAsXML(propertys : string[], filter : Filter[], sortcolumn : string[], filename : string) {
        this.getProjectLayouts(propertys, filter, sortcolumn, MMDAProject.XML, filename);
    }

    public getProjectLayoutsAsTXT(propertys : string[], filter : Filter[], sortcolumn : string[], filename : string) {
        this.getProjectLayouts(propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    }

    public getProjectLayoutssAsJSON(propertys : string[], filter : Filter[], sortcolumn : string[], filename : string) {
        this.getProjectLayouts(propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    }

    protected loadAllLayoutsAsPromise(layouts : pages.ILayout[]): when.Promise<pages.Layout[]> {
        return when.all<pages.Layout[]>(layouts.map( lay => loadAsPromise(lay)));
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

