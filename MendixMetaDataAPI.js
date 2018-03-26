"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mendixmodelsdk_1 = require("mendixmodelsdk");
var mendixplatformsdk_1 = require("mendixplatformsdk");
var when = require("when");
var fs = require("fs-extra");
var MMDAO = require("./MMDAOutputObject");
var MMDAA = require("./MMDAObjectAdapter");
//Mendix Analytics Project without specified Output Type
var MMDAProject = /** @class */ (function () {
    //Standard Constructor creates Mendix SDK Client and Project
    function MMDAProject(username, apikey, appid) {
        this.name = username;
        this.key = apikey;
        this.id = appid;
        this.client = new mendixplatformsdk_1.MendixSdkClient(this.name, this.key);
        this.project = new mendixplatformsdk_1.Project(this.client, this.id, "");
    }
    /*
    Gets Documents from whole Project
    Parameter: qrypropertys : string[]      Array of property constants of wanted propertys
    Parameter: qryfiltertypes : string[]    Array of filter constants of propertys to filter
    Parameter: qryfiltervalues : string[]   Array of Values for the filters
    Parameter: qrysortcolumns : number[]    Array of Columnnumbers for sorting
    Parameter: qryresulttype : string       Constant which ResultType should be used
    */
    MMDAProject.prototype.getProjectDocuments = function (qrypropertys, filter, qrysortcolumns, qryresulttype, filename) {
        var _this = this;
        var outputobjects = new MMDAO.OutputObjectList();
        this.project.createWorkingCopy().then(function (workingCopy) {
            return workingCopy.model().allDocuments();
        })
            .then(function (documents) {
            return _this.loadAllDocumentsAsPromise(documents);
        })
            .done(function (loadeddocs) {
            loadeddocs.forEach(function (doc) {
                if (doc instanceof mendixmodelsdk_1.projects.Document) {
                    var documentadapter = new MMDAA.DocumentAdapter();
                    var propertys = new Array();
                    var MMDAobj;
                    propertys = documentadapter.getDocumentPropertys(doc, qrypropertys);
                    MMDAobj = new MMDAO.OutputObject(propertys, "Document"); //Get filtered Documents
                    if (documentadapter.filter(MMDAobj, filter)) {
                        outputobjects.addObject(MMDAobj); //filter object
                    }
                }
                else {
                    console.log("Got Document which is not instance of projects.Document");
                }
            });
            outputobjects = outputobjects.sort(qrysortcolumns); //Sort Objects
            outputobjects.returnResult(qryresulttype, filename); //Return As Output Type
            console.log("Im Done!!!");
        });
    };
    MMDAProject.prototype.getProjectDocumentsAsHTML = function (propertys, filter, sortcolumn, filename) {
        this.getProjectDocuments(propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    };
    MMDAProject.prototype.getProjectDocumentsAsXML = function (propertys, filter, sortcolumn, filename) {
        this.getProjectDocuments(propertys, filter, sortcolumn, MMDAProject.XML, filename);
    };
    MMDAProject.prototype.getProjectDocumentsAsTXT = function (propertys, filter, sortcolumn, filename) {
        this.getProjectDocuments(propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    };
    MMDAProject.prototype.getProjectDocumentsAsJSON = function (propertys, filter, sortcolumn, filename) {
        this.getProjectDocuments(propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    };
    MMDAProject.prototype.getModuleDocuments = function (modulename, qrypropertys, filter, qrysortcolumns, qryresulttype, filename) {
        var outputobjects = new MMDAO.OutputObjectList();
        this.project.createWorkingCopy().then(function (workingCopy) {
            return workingCopy.model().findModuleByQualifiedName(modulename);
        })
            .done(function (modul) {
            modul.documents.forEach(function (doc) {
                if (doc instanceof mendixmodelsdk_1.projects.Document) {
                    var documentadapter = new MMDAA.DocumentAdapter();
                    var propertys = new Array();
                    var MMDAobj;
                    propertys = documentadapter.getDocumentPropertys(doc, qrypropertys);
                    MMDAobj = new MMDAO.OutputObject(propertys, "Document"); //Get filtered Documents
                    if (documentadapter.filter(MMDAobj, filter)) {
                        outputobjects.addObject(MMDAobj); //filter object
                    }
                }
                else {
                    console.log("Got Document which is not instance of projects.Document");
                }
            });
            outputobjects = outputobjects.sort(qrysortcolumns); //Sort Objects
            outputobjects.returnResult(qryresulttype, filename); //Return As Output Type
            console.log("Im Done!!!");
        });
    };
    MMDAProject.prototype.getModuleDocumentsAsTXT = function (modulename, propertys, filter, sortcolumn, filename) {
        this.getModuleDocuments(modulename, propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    };
    MMDAProject.prototype.getModuleDocumentsAsHTML = function (modulename, propertys, filter, sortcolumn, filename) {
        this.getModuleDocuments(modulename, propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    };
    MMDAProject.prototype.getModuleDocumentsAsXML = function (modulename, propertys, filter, sortcolumn, filename) {
        this.getModuleDocuments(modulename, propertys, filter, sortcolumn, MMDAProject.XML, filename);
    };
    MMDAProject.prototype.getModuleDocumentsAsJSON = function (modulename, propertys, filter, sortcolumn, filename) {
        this.getModuleDocuments(modulename, propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    };
    MMDAProject.prototype.getFolderDocuments = function (foldername, qrypropertys, filter, qrysortcolumns, qryresulttype, filename) {
        var outputobjects = new MMDAO.OutputObjectList();
        var folderfound = false;
        this.project.createWorkingCopy().then(function (workingCopy) {
            return workingCopy.model().allFolders();
        })
            .done(function (folders) {
            folders.forEach(function (folder) {
                if (folder.name == foldername) {
                    folderfound = true;
                    folder.documents.forEach(function (doc) {
                        if (doc instanceof mendixmodelsdk_1.projects.Document) {
                            var documentadapter = new MMDAA.DocumentAdapter();
                            var propertys = new Array();
                            var MMDAobj;
                            propertys = documentadapter.getDocumentPropertys(doc, qrypropertys);
                            MMDAobj = new MMDAO.OutputObject(propertys, "Document"); //Get filtered Documents
                            if (documentadapter.filter(MMDAobj, filter)) {
                                outputobjects.addObject(MMDAobj); //filter object
                            }
                        }
                        else {
                            console.log("Got Document which is not instance of projects.Document");
                        }
                    });
                    outputobjects = outputobjects.sort(qrysortcolumns); //Sort Objects
                    outputobjects.returnResult(qryresulttype, filename); //Return As Output Type
                    console.log("Im Done!!!");
                }
            });
            if (!folderfound) {
                fs.outputFile(filename, "Ordner mit dem Namen " + foldername + " wurde nicht gefunden");
            }
        });
    };
    MMDAProject.prototype.getFolderDocumentsAsHTML = function (foldername, propertys, filter, sortcolumn, filename) {
        this.getFolderDocuments(foldername, propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    };
    MMDAProject.prototype.getFolderDocumentsAsTXT = function (foldername, propertys, filter, sortcolumn, filename) {
        this.getFolderDocuments(foldername, propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    };
    MMDAProject.prototype.getFolderDocumentsAsXML = function (foldername, propertys, filter, sortcolumn, filename) {
        this.getFolderDocuments(foldername, propertys, filter, sortcolumn, MMDAProject.XML, filename);
    };
    MMDAProject.prototype.getFolderDocumentsAsJSON = function (foldername, propertys, filter, sortcolumn, filename) {
        this.getFolderDocuments(foldername, propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    };
    MMDAProject.prototype.loadAllDocumentsAsPromise = function (documents) {
        return when.all(documents.map(function (doc) { return mendixplatformsdk_1.loadAsPromise(doc); }));
    };
    MMDAProject.prototype.getProjectDomainModels = function (qrypropertys, filter, qrysortcolumns, qryresulttype, filename) {
        var _this = this;
        var outputobjects = new MMDAO.OutputObjectList();
        this.project.createWorkingCopy().then(function (workingCopy) {
            return workingCopy.model().allDomainModels();
        })
            .then(function (domainmodels) {
            return _this.loadAllDomainModelsAsPromise(domainmodels);
        })
            .done(function (loadeddms) {
            loadeddms.forEach(function (dm) {
                if (dm instanceof mendixmodelsdk_1.domainmodels.DomainModel) {
                    var domainmodeladapter = new MMDAA.DomainModelAdapter();
                    var propertys = new Array();
                    var MMDAobj;
                    propertys = domainmodeladapter.getDomainModelPropertys(dm, qrypropertys);
                    MMDAobj = new MMDAO.OutputObject(propertys, "DomainModel"); //Get filtered Documents
                    if (domainmodeladapter.filter(MMDAobj, filter)) {
                        outputobjects.addObject(MMDAobj); //filter object
                    }
                }
                else {
                    console.log("Got Constant which is not instance of constants.Constant");
                }
            });
            outputobjects = outputobjects.sort(qrysortcolumns); //Sort Objects
            outputobjects.returnResult(qryresulttype, filename); //Return As Output Type
            console.log("Im Done!!!");
        });
    };
    MMDAProject.prototype.getProjectDomainModelsAsHTML = function (propertys, filter, sortcolumn, filename) {
        this.getProjectDomainModels(propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    };
    MMDAProject.prototype.getProjectDomainModelsAsXML = function (propertys, filter, sortcolumn, filename) {
        this.getProjectDomainModels(propertys, filter, sortcolumn, MMDAProject.XML, filename);
    };
    MMDAProject.prototype.getProjectDomainModelsAsTXT = function (propertys, filter, sortcolumn, filename) {
        this.getProjectDomainModels(propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    };
    MMDAProject.prototype.getProjectDomainModelsAsJSON = function (propertys, filter, sortcolumn, filename) {
        this.getProjectDomainModels(propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    };
    MMDAProject.prototype.loadAllDomainModelsAsPromise = function (domainmodels) {
        return when.all(domainmodels.map(function (dm) { return mendixplatformsdk_1.loadAsPromise(dm); }));
    };
    MMDAProject.prototype.getProjectConstants = function (qrypropertys, filter, qrysortcolumns, qryresulttype, filename) {
        var _this = this;
        var outputobjects = new MMDAO.OutputObjectList();
        this.project.createWorkingCopy().then(function (workingCopy) {
            return workingCopy.model().allConstants();
        })
            .then(function (constants) {
            return _this.loadAllConstantsAsPromise(constants);
        })
            .done(function (loadedcons) {
            loadedcons.forEach(function (con) {
                if (con instanceof mendixmodelsdk_1.constants.Constant) {
                    var constantadapter = new MMDAA.ConstantAdapter();
                    var propertys = new Array();
                    var MMDAobj;
                    propertys = constantadapter.getConstantPropertys(con, qrypropertys);
                    MMDAobj = new MMDAO.OutputObject(propertys, "Constant"); //Get filtered Documents
                    if (constantadapter.filter(MMDAobj, filter)) {
                        outputobjects.addObject(MMDAobj); //filter object
                    }
                }
                else {
                    console.log("Got Constant which is not instance of constants.Constant");
                }
            });
            outputobjects = outputobjects.sort(qrysortcolumns); //Sort Objects
            outputobjects.returnResult(qryresulttype, filename); //Return As Output Type
            console.log("Im Done!!!");
        });
    };
    MMDAProject.prototype.getProjectConstantsAsHTML = function (propertys, filter, sortcolumn, filename) {
        this.getProjectConstants(propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    };
    MMDAProject.prototype.getProjectConstantsAsXML = function (propertys, filter, sortcolumn, filename) {
        this.getProjectConstants(propertys, filter, sortcolumn, MMDAProject.XML, filename);
    };
    MMDAProject.prototype.getProjectConstantsAsTXT = function (propertys, filter, sortcolumn, filename) {
        this.getProjectConstants(propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    };
    MMDAProject.prototype.getProjectConstantsAsJSON = function (propertys, filter, sortcolumn, filename) {
        this.getProjectConstants(propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    };
    MMDAProject.prototype.loadAllConstantsAsPromise = function (constants) {
        return when.all(constants.map(function (con) { return mendixplatformsdk_1.loadAsPromise(con); }));
    };
    MMDAProject.prototype.getProjectEnumerations = function (qrypropertys, filter, qrysortcolumns, qryresulttype, filename) {
        var _this = this;
        var outputobjects = new MMDAO.OutputObjectList();
        this.project.createWorkingCopy().then(function (workingCopy) {
            return workingCopy.model().allEnumerations();
        })
            .then(function (enumerations) {
            return _this.loadAllEnumerationsAsPromise(enumerations);
        })
            .done(function (loadedenums) {
            loadedenums.forEach(function (num) {
                if (num instanceof mendixmodelsdk_1.enumerations.Enumeration) {
                    var enumadapter = new MMDAA.EnumerationAdapter();
                    var propertys = new Array();
                    var MMDAobj;
                    propertys = enumadapter.getEnumerationPropertys(num, qrypropertys);
                    MMDAobj = new MMDAO.OutputObject(propertys, "Enumeration"); //Get filtered Documents
                    if (enumadapter.filter(MMDAobj, filter)) {
                        outputobjects.addObject(MMDAobj); //filter object
                    }
                }
                else {
                    console.log("Got Enumeration which is not instance of enumerations.Enumeration");
                }
            });
            outputobjects = outputobjects.sort(qrysortcolumns); //Sort Objects
            outputobjects.returnResult(qryresulttype, filename); //Return As Output Type
            console.log("Im Done!!!");
        });
    };
    MMDAProject.prototype.getProjectEnumerationsAsHTML = function (propertys, filter, sortcolumn, filename) {
        this.getProjectEnumerations(propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    };
    MMDAProject.prototype.getProjectEnumerationsAsXML = function (propertys, filter, sortcolumn, filename) {
        this.getProjectEnumerations(propertys, filter, sortcolumn, MMDAProject.XML, filename);
    };
    MMDAProject.prototype.getProjectEnumerationsAsTXT = function (propertys, filter, sortcolumn, filename) {
        this.getProjectEnumerations(propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    };
    MMDAProject.prototype.getProjectEnumerationsAsJSON = function (propertys, filter, sortcolumn, filename) {
        this.getProjectEnumerations(propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    };
    MMDAProject.prototype.loadAllEnumerationsAsPromise = function (enumerations) {
        return when.all(enumerations.map(function (num) { return mendixplatformsdk_1.loadAsPromise(num); }));
    };
    MMDAProject.prototype.getProjectImageCollections = function (qrypropertys, filter, qrysortcolumns, qryresulttype, filename) {
        var _this = this;
        var outputobjects = new MMDAO.OutputObjectList();
        this.project.createWorkingCopy().then(function (workingCopy) {
            return workingCopy.model().allImageCollections();
        })
            .then(function (imagecollections) {
            return _this.loadAllImageCollectionsAsPromise(imagecollections);
        })
            .done(function (loadedimgcol) {
            loadedimgcol.forEach(function (imgcol) {
                if (imgcol instanceof mendixmodelsdk_1.images.ImageCollection) {
                    var imgcoladapter = new MMDAA.ImageCollectionAdapter();
                    var propertys = new Array();
                    var MMDAobj;
                    propertys = imgcoladapter.getImageCollectionPropertys(imgcol, qrypropertys);
                    MMDAobj = new MMDAO.OutputObject(propertys, "ImageCollection"); //Get filtered Documents
                    if (imgcoladapter.filter(MMDAobj, filter)) {
                        outputobjects.addObject(MMDAobj); //filter object
                    }
                }
                else {
                    console.log("Got ImageCollection which is not instance of images.ImageCollection");
                }
            });
            outputobjects = outputobjects.sort(qrysortcolumns); //Sort Objects
            outputobjects.returnResult(qryresulttype, filename); //Return As Output Type
            console.log("Im Done!!!");
        });
    };
    MMDAProject.prototype.getProjectImageCollectionsAsHTML = function (propertys, filter, sortcolumn, filename) {
        this.getProjectImageCollections(propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    };
    MMDAProject.prototype.getProjectImageCollectionsAsXML = function (propertys, filter, sortcolumn, filename) {
        this.getProjectImageCollections(propertys, filter, sortcolumn, MMDAProject.XML, filename);
    };
    MMDAProject.prototype.getProjectImageCollectionsAsTXT = function (propertys, filter, sortcolumn, filename) {
        this.getProjectImageCollections(propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    };
    MMDAProject.prototype.getProjectImageCollectionsAsJSON = function (propertys, filter, sortcolumn, filename) {
        this.getProjectImageCollections(propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    };
    MMDAProject.prototype.loadAllImageCollectionsAsPromise = function (imagecollections) {
        return when.all(imagecollections.map(function (img) { return mendixplatformsdk_1.loadAsPromise(img); }));
    };
    MMDAProject.prototype.getProjectFolders = function (qrypropertys, filter, qrysortcolumns, qryresulttype, filename) {
        var outputobjects = new MMDAO.OutputObjectList();
        this.project.createWorkingCopy().then(function (workingCopy) {
            return workingCopy.model().allFolders();
        })
            .then(function (folders) {
            return folders;
        })
            .done(function (loadedfolders) {
            loadedfolders.forEach(function (folder) {
                if (folder instanceof mendixmodelsdk_1.projects.Folder) {
                    var folderadapter = new MMDAA.FolderAdapter();
                    var propertys = new Array();
                    var MMDAobj;
                    propertys = folderadapter.getFolderPropertys(folder, qrypropertys);
                    MMDAobj = new MMDAO.OutputObject(propertys, "Folder"); //Get filtered Documents
                    if (folderadapter.filter(MMDAobj, filter)) {
                        outputobjects.addObject(MMDAobj); //filter object
                    }
                }
                else {
                    console.log("Got Folder which is not instance of projects.Folder");
                }
            });
            outputobjects = outputobjects.sort(qrysortcolumns); //Sort Objects
            outputobjects.returnResult(qryresulttype, filename); //Return As Output Type
            console.log("Im Done!!!");
        });
    };
    MMDAProject.prototype.getProjectFoldersAsHTML = function (propertys, filter, sortcolumn, filename) {
        this.getProjectFolders(propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    };
    MMDAProject.prototype.getProjectFoldersAsXML = function (propertys, filter, sortcolumn, filename) {
        this.getProjectFolders(propertys, filter, sortcolumn, MMDAProject.XML, filename);
    };
    MMDAProject.prototype.getProjectFoldersAsTXT = function (propertys, filter, sortcolumn, filename) {
        this.getProjectFolders(propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    };
    MMDAProject.prototype.getProjectFoldersAsJSON = function (propertys, filter, sortcolumn, filename) {
        this.getProjectFolders(propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    };
    MMDAProject.prototype.getProjectLayouts = function (qrypropertys, filter, qrysortcolumns, qryresulttype, filename) {
        var _this = this;
        var outputobjects = new MMDAO.OutputObjectList();
        this.project.createWorkingCopy().then(function (workingCopy) {
            return workingCopy.model().allLayouts();
        })
            .then(function (layouts) {
            return _this.loadAllLayoutsAsPromise(layouts);
        })
            .done(function (loadedlayouts) {
            loadedlayouts.forEach(function (layout) {
                if (layout instanceof mendixmodelsdk_1.pages.Layout) {
                    var layoutadapter = new MMDAA.LayoutAdapter();
                    var propertys = new Array();
                    var MMDAobj;
                    propertys = layoutadapter.getLayoutPropertys(layout, qrypropertys);
                    MMDAobj = new MMDAO.OutputObject(propertys, "Layout");
                    if (layoutadapter.filter(MMDAobj, filter)) {
                        outputobjects.addObject(MMDAobj);
                    }
                }
                else {
                    console.log("Got Layout which is not instance of pages.Layout");
                }
            });
            outputobjects = outputobjects.sort(qrysortcolumns); //Sort Objects
            outputobjects.returnResult(qryresulttype, filename); //Return As Output Type
            console.log("Im Done!!!");
        });
    };
    MMDAProject.prototype.getProjectLayoutsAsHTML = function (propertys, filter, sortcolumn, filename) {
        this.getProjectLayouts(propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    };
    MMDAProject.prototype.getProjectLayoutsAsXML = function (propertys, filter, sortcolumn, filename) {
        this.getProjectLayouts(propertys, filter, sortcolumn, MMDAProject.XML, filename);
    };
    MMDAProject.prototype.getProjectLayoutsAsTXT = function (propertys, filter, sortcolumn, filename) {
        this.getProjectLayouts(propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    };
    MMDAProject.prototype.getProjectLayoutssAsJSON = function (propertys, filter, sortcolumn, filename) {
        this.getProjectLayouts(propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    };
    MMDAProject.prototype.loadAllLayoutsAsPromise = function (layouts) {
        return when.all(layouts.map(function (lay) { return mendixplatformsdk_1.loadAsPromise(lay); }));
    };
    //Constants to define output target
    MMDAProject.TEXTFILE = "TEXTFILE";
    MMDAProject.HTMLTABLE = "HTMLTABLE";
    MMDAProject.XML = "XML";
    MMDAProject.JSON = "JSON";
    return MMDAProject;
}());
exports.MMDAProject = MMDAProject;
var Filter = /** @class */ (function () {
    function Filter(filtertype, filtervalue) {
        this.filtertype = filtertype;
        this.filtervalue = filtervalue;
    }
    Filter.prototype.getType = function () {
        return this.filtertype;
    };
    Filter.prototype.getValue = function () {
        return this.filtervalue;
    };
    return Filter;
}());
exports.Filter = Filter;
