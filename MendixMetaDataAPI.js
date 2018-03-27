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
    MMDAProject.prototype.traverseFoldersForDocuments = function (folders) {
        var _this = this;
        var documents = new Array();
        folders.forEach(function (folder) {
            folder.documents.forEach(function (doc) {
                documents[documents.length] = doc;
            });
            var subdocuments = new Array();
            subdocuments = _this.traverseFoldersForDocuments(folder.folders);
            subdocuments.forEach(function (subdoc) {
                documents[documents.length] = subdoc;
            });
        });
        return documents;
    };
    MMDAProject.prototype.traverseFoldersForFolders = function (folders) {
        var _this = this;
        var foundfolders = new Array();
        folders.forEach(function (folder) {
            foundfolders[foundfolders.length] = folder;
            var subfolders = new Array();
            subfolders = _this.traverseFoldersForFolders(folder.folders);
            subfolders.forEach(function (subfold) {
                foundfolders[foundfolders.length] = subfold;
            });
        });
        return foundfolders;
    };
    MMDAProject.prototype.returnDocuments = function (documents, qrypropertys, filter, qrysortcolumns, qryresulttype, filename) {
        var outputobjects = new MMDAO.OutputObjectList();
        documents.forEach(function (doc) {
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
    };
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
        this.project.createWorkingCopy().then(function (workingCopy) {
            return workingCopy.model().allDocuments();
        })
            .then(function (documents) {
            return _this.loadAllDocumentsAsPromise(documents);
        })
            .done(function (loadeddocs) {
            _this.returnDocuments(loadeddocs, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
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
        var _this = this;
        this.project.createWorkingCopy().then(function (workingCopy) {
            return workingCopy.model().findModuleByQualifiedName(modulename);
        })
            .then(function (modul) {
            var documents;
            documents = _this.traverseFoldersForDocuments(modul.folders);
            modul.documents.forEach(function (doc) {
                documents[documents.length] = doc;
            });
            return _this.loadAllDocumentsAsPromise(documents);
        })
            .done(function (loadeddocs) {
            _this.returnDocuments(loadeddocs, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
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
        var _this = this;
        var folderfound = false;
        var searchedfolder;
        this.project.createWorkingCopy().then(function (workingCopy) {
            return workingCopy.model().allFolders();
        })
            .then(function (folders) {
            folders.forEach(function (folder) {
                if (folder.name == foldername) {
                    folderfound = true;
                    searchedfolder = folder;
                }
            });
            if (!folderfound) {
                fs.outputFile(filename, "Ordner mit dem Namen " + foldername + " wurde nicht gefunden");
            }
            var documents;
            documents = _this.traverseFoldersForDocuments(searchedfolder.folders);
            searchedfolder.documents.forEach(function (doc) {
                documents[documents.length] = doc;
            });
            return _this.loadAllDocumentsAsPromise(documents);
        })
            .done(function (loadeddocs) {
            _this.returnDocuments(loadeddocs, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
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
    MMDAProject.prototype.returnDomainModels = function (domainmods, qrypropertys, filter, qrysortcolumns, qryresulttype, filename) {
        var outputobjects = new MMDAO.OutputObjectList();
        domainmods.forEach(function (dm) {
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
    };
    MMDAProject.prototype.getProjectDomainModels = function (qrypropertys, filter, qrysortcolumns, qryresulttype, filename) {
        var _this = this;
        this.project.createWorkingCopy().then(function (workingCopy) {
            return workingCopy.model().allDomainModels();
        })
            .then(function (domainmodels) {
            return _this.loadAllDomainModelsAsPromise(domainmodels);
        })
            .done(function (loadeddms) {
            _this.returnDomainModels(loadeddms, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
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
    MMDAProject.prototype.getModuleDomainModels = function (modulename, qrypropertys, filter, qrysortcolumns, qryresulttype, filename) {
        var _this = this;
        this.project.createWorkingCopy().then(function (workingCopy) {
            return workingCopy.model().findModuleByQualifiedName(modulename);
        })
            .then(function (modul) {
            return _this.loadAllDomainModelsAsPromise([modul.domainModel]);
        })
            .done(function (loadeddomainmodels) {
            _this.returnDomainModels(loadeddomainmodels, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
        });
    };
    MMDAProject.prototype.getModuleDomainModelsAsTXT = function (modulename, propertys, filter, sortcolumn, filename) {
        this.getModuleDomainModels(modulename, propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    };
    MMDAProject.prototype.getModuleDomainModelsAsHTML = function (modulename, propertys, filter, sortcolumn, filename) {
        this.getModuleDomainModels(modulename, propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    };
    MMDAProject.prototype.getModuleDomainModelsAsXML = function (modulename, propertys, filter, sortcolumn, filename) {
        this.getModuleDomainModels(modulename, propertys, filter, sortcolumn, MMDAProject.XML, filename);
    };
    MMDAProject.prototype.getModuleDomainModelsAsJSON = function (modulename, propertys, filter, sortcolumn, filename) {
        this.getModuleDomainModels(modulename, propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    };
    MMDAProject.prototype.loadAllDomainModelsAsPromise = function (domainmodels) {
        return when.all(domainmodels.map(function (dm) { return mendixplatformsdk_1.loadAsPromise(dm); }));
    };
    MMDAProject.prototype.returnConstants = function (loadedcons, qrypropertys, filter, qrysortcolumns, qryresulttype, filename) {
        var outputobjects = new MMDAO.OutputObjectList();
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
    };
    MMDAProject.prototype.getProjectConstants = function (qrypropertys, filter, qrysortcolumns, qryresulttype, filename) {
        var _this = this;
        this.project.createWorkingCopy().then(function (workingCopy) {
            return workingCopy.model().allConstants();
        })
            .then(function (constants) {
            return _this.loadAllConstantsAsPromise(constants);
        })
            .done(function (loadedcons) {
            _this.returnConstants(loadedcons, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
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
    MMDAProject.prototype.getModuleConstants = function (modulename, qrypropertys, filter, qrysortcolumns, qryresulttype, filename) {
        var _this = this;
        this.project.createWorkingCopy().then(function (workingCopy) {
            return workingCopy.model().findModuleByQualifiedName(modulename);
        })
            .then(function (modul) {
            var documents;
            documents = _this.traverseFoldersForDocuments(modul.folders);
            modul.documents.forEach(function (doc) {
                documents[documents.length] = doc;
            });
            var cons = new Array();
            documents.forEach(function (doc) {
                if (doc instanceof mendixmodelsdk_1.constants.Constant) {
                    cons[cons.length] = doc;
                }
            });
            return _this.loadAllConstantsAsPromise(cons);
        })
            .done(function (loadedcons) {
            _this.returnConstants(loadedcons, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
        });
    };
    MMDAProject.prototype.getModuleConstantsAsTXT = function (modulename, propertys, filter, sortcolumn, filename) {
        this.getModuleConstants(modulename, propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    };
    MMDAProject.prototype.getModuleConstantsAsHTML = function (modulename, propertys, filter, sortcolumn, filename) {
        this.getModuleConstants(modulename, propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    };
    MMDAProject.prototype.getModuleConstantsAsXML = function (modulename, propertys, filter, sortcolumn, filename) {
        this.getModuleConstants(modulename, propertys, filter, sortcolumn, MMDAProject.XML, filename);
    };
    MMDAProject.prototype.getModuleConstantsAsJSON = function (modulename, propertys, filter, sortcolumn, filename) {
        this.getModuleConstants(modulename, propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    };
    MMDAProject.prototype.getFolderConstants = function (foldername, qrypropertys, filter, qrysortcolumns, qryresulttype, filename) {
        var _this = this;
        var folderfound = false;
        var searchedfolder;
        this.project.createWorkingCopy().then(function (workingCopy) {
            return workingCopy.model().allFolders();
        })
            .then(function (folders) {
            folders.forEach(function (folder) {
                if (folder.name == foldername) {
                    folderfound = true;
                    searchedfolder = folder;
                }
            });
            if (!folderfound) {
                fs.outputFile(filename, "Ordner mit dem Namen " + foldername + " wurde nicht gefunden");
            }
            var documents = new Array();
            documents = _this.traverseFoldersForDocuments(searchedfolder.folders);
            searchedfolder.documents.forEach(function (doc) {
                documents[documents.length] = doc;
            });
            var cons = new Array();
            documents.forEach(function (doc) {
                if (doc instanceof mendixmodelsdk_1.constants.Constant) {
                    cons[cons.length] = doc;
                }
            });
            return _this.loadAllConstantsAsPromise(cons);
        })
            .done(function (loadedcons) {
            _this.returnConstants(loadedcons, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
        });
    };
    MMDAProject.prototype.getFolderConstantsAsHTML = function (foldername, propertys, filter, sortcolumn, filename) {
        this.getFolderConstants(foldername, propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    };
    MMDAProject.prototype.getFolderConstantsAsTXT = function (foldername, propertys, filter, sortcolumn, filename) {
        this.getFolderConstants(foldername, propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    };
    MMDAProject.prototype.getFolderConstantsAsXML = function (foldername, propertys, filter, sortcolumn, filename) {
        this.getFolderConstants(foldername, propertys, filter, sortcolumn, MMDAProject.XML, filename);
    };
    MMDAProject.prototype.getFolderConstantsAsJSON = function (foldername, propertys, filter, sortcolumn, filename) {
        this.getFolderConstants(foldername, propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    };
    MMDAProject.prototype.loadAllConstantsAsPromise = function (constants) {
        return when.all(constants.map(function (con) { return mendixplatformsdk_1.loadAsPromise(con); }));
    };
    MMDAProject.prototype.returnEnumerations = function (loadedenums, qrypropertys, filter, qrysortcolumns, qryresulttype, filename) {
        var outputobjects = new MMDAO.OutputObjectList();
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
    };
    MMDAProject.prototype.getProjectEnumerations = function (qrypropertys, filter, qrysortcolumns, qryresulttype, filename) {
        var _this = this;
        this.project.createWorkingCopy().then(function (workingCopy) {
            return workingCopy.model().allEnumerations();
        })
            .then(function (enumerations) {
            return _this.loadAllEnumerationsAsPromise(enumerations);
        })
            .done(function (loadedenums) {
            _this.returnEnumerations(loadedenums, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
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
    MMDAProject.prototype.getModuleEnumerations = function (modulename, qrypropertys, filter, qrysortcolumns, qryresulttype, filename) {
        var _this = this;
        this.project.createWorkingCopy().then(function (workingCopy) {
            return workingCopy.model().findModuleByQualifiedName(modulename);
        })
            .then(function (modul) {
            var documents;
            documents = _this.traverseFoldersForDocuments(modul.folders);
            modul.documents.forEach(function (doc) {
                documents[documents.length] = doc;
            });
            var enums = new Array();
            documents.forEach(function (doc) {
                if (doc instanceof mendixmodelsdk_1.enumerations.Enumeration) {
                    enums[enums.length] = doc;
                }
            });
            return _this.loadAllEnumerationsAsPromise(enums);
        })
            .done(function (loadedenums) {
            _this.returnEnumerations(loadedenums, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
        });
    };
    MMDAProject.prototype.getModuleEnumerationsAsTXT = function (modulename, propertys, filter, sortcolumn, filename) {
        this.getModuleEnumerations(modulename, propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    };
    MMDAProject.prototype.getModuleEnumerationsAsHTML = function (modulename, propertys, filter, sortcolumn, filename) {
        this.getModuleEnumerations(modulename, propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    };
    MMDAProject.prototype.getModuleEnumerationsAsXML = function (modulename, propertys, filter, sortcolumn, filename) {
        this.getModuleEnumerations(modulename, propertys, filter, sortcolumn, MMDAProject.XML, filename);
    };
    MMDAProject.prototype.getModuleEnumerationsAsJSON = function (modulename, propertys, filter, sortcolumn, filename) {
        this.getModuleEnumerations(modulename, propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    };
    MMDAProject.prototype.getFolderEnumerations = function (foldername, qrypropertys, filter, qrysortcolumns, qryresulttype, filename) {
        var _this = this;
        var folderfound = false;
        var searchedfolder;
        this.project.createWorkingCopy().then(function (workingCopy) {
            return workingCopy.model().allFolders();
        })
            .then(function (folders) {
            folders.forEach(function (folder) {
                if (folder.name == foldername) {
                    folderfound = true;
                    searchedfolder = folder;
                }
            });
            if (!folderfound) {
                fs.outputFile(filename, "Ordner mit dem Namen " + foldername + " wurde nicht gefunden");
            }
            var documents = new Array();
            documents = _this.traverseFoldersForDocuments(searchedfolder.folders);
            searchedfolder.documents.forEach(function (doc) {
                documents[documents.length] = doc;
            });
            var enums = new Array();
            documents.forEach(function (doc) {
                if (doc instanceof mendixmodelsdk_1.enumerations.Enumeration) {
                    enums[enums.length] = doc;
                }
            });
            return _this.loadAllEnumerationsAsPromise(enums);
        })
            .done(function (loadedenums) {
            _this.returnEnumerations(loadedenums, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
        });
    };
    MMDAProject.prototype.getFolderEnumerationsAsHTML = function (foldername, propertys, filter, sortcolumn, filename) {
        this.getFolderEnumerations(foldername, propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    };
    MMDAProject.prototype.getFolderEnumerationsAsTXT = function (foldername, propertys, filter, sortcolumn, filename) {
        this.getFolderEnumerations(foldername, propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    };
    MMDAProject.prototype.getFolderEnumerationsAsXML = function (foldername, propertys, filter, sortcolumn, filename) {
        this.getFolderEnumerations(foldername, propertys, filter, sortcolumn, MMDAProject.XML, filename);
    };
    MMDAProject.prototype.getFolderEnumerationsAsJSON = function (foldername, propertys, filter, sortcolumn, filename) {
        this.getFolderEnumerations(foldername, propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    };
    MMDAProject.prototype.loadAllEnumerationsAsPromise = function (enumerations) {
        return when.all(enumerations.map(function (num) { return mendixplatformsdk_1.loadAsPromise(num); }));
    };
    MMDAProject.prototype.returnImageCollections = function (loadedimgcol, qrypropertys, filter, qrysortcolumns, qryresulttype, filename) {
        var outputobjects = new MMDAO.OutputObjectList();
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
    };
    MMDAProject.prototype.getProjectImageCollections = function (qrypropertys, filter, qrysortcolumns, qryresulttype, filename) {
        var _this = this;
        this.project.createWorkingCopy().then(function (workingCopy) {
            return workingCopy.model().allImageCollections();
        })
            .then(function (imagecollections) {
            return _this.loadAllImageCollectionsAsPromise(imagecollections);
        })
            .done(function (loadedimgcol) {
            _this.returnImageCollections(loadedimgcol, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
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
    MMDAProject.prototype.getModuleImageCollections = function (modulename, qrypropertys, filter, qrysortcolumns, qryresulttype, filename) {
        var _this = this;
        this.project.createWorkingCopy().then(function (workingCopy) {
            return workingCopy.model().findModuleByQualifiedName(modulename);
        })
            .then(function (modul) {
            var documents;
            documents = _this.traverseFoldersForDocuments(modul.folders);
            modul.documents.forEach(function (doc) {
                documents[documents.length] = doc;
            });
            var imgcols = new Array();
            documents.forEach(function (doc) {
                if (doc instanceof mendixmodelsdk_1.images.ImageCollection) {
                    imgcols[imgcols.length] = doc;
                }
            });
            return _this.loadAllImageCollectionsAsPromise(imgcols);
        })
            .done(function (loadedimgcols) {
            _this.returnImageCollections(loadedimgcols, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
        });
    };
    MMDAProject.prototype.getModuleImageCollectionsAsTXT = function (modulename, propertys, filter, sortcolumn, filename) {
        this.getModuleImageCollections(modulename, propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    };
    MMDAProject.prototype.getModuleImageCollectionsAsHTML = function (modulename, propertys, filter, sortcolumn, filename) {
        this.getModuleImageCollections(modulename, propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    };
    MMDAProject.prototype.getModuleImageCollectionsAsXML = function (modulename, propertys, filter, sortcolumn, filename) {
        this.getModuleImageCollections(modulename, propertys, filter, sortcolumn, MMDAProject.XML, filename);
    };
    MMDAProject.prototype.getModuleImageCollectionsAsJSON = function (modulename, propertys, filter, sortcolumn, filename) {
        this.getModuleImageCollections(modulename, propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    };
    MMDAProject.prototype.getFolderImageCollections = function (foldername, qrypropertys, filter, qrysortcolumns, qryresulttype, filename) {
        var _this = this;
        var folderfound = false;
        var searchedfolder;
        this.project.createWorkingCopy().then(function (workingCopy) {
            return workingCopy.model().allFolders();
        })
            .then(function (folders) {
            folders.forEach(function (folder) {
                if (folder.name == foldername) {
                    folderfound = true;
                    searchedfolder = folder;
                }
            });
            if (!folderfound) {
                fs.outputFile(filename, "Ordner mit dem Namen " + foldername + " wurde nicht gefunden");
            }
            var documents = new Array();
            documents = _this.traverseFoldersForDocuments(searchedfolder.folders);
            searchedfolder.documents.forEach(function (doc) {
                documents[documents.length] = doc;
            });
            var imgcols = new Array();
            documents.forEach(function (doc) {
                if (doc instanceof mendixmodelsdk_1.images.ImageCollection) {
                    imgcols[imgcols.length] = doc;
                }
            });
            return _this.loadAllImageCollectionsAsPromise(imgcols);
        })
            .done(function (loadedimgcols) {
            _this.returnImageCollections(loadedimgcols, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
        });
    };
    MMDAProject.prototype.getFolderImageCollectionsAsHTML = function (foldername, propertys, filter, sortcolumn, filename) {
        this.getFolderImageCollections(foldername, propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    };
    MMDAProject.prototype.getFolderImageCollectionsAsTXT = function (foldername, propertys, filter, sortcolumn, filename) {
        this.getFolderImageCollections(foldername, propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    };
    MMDAProject.prototype.getFolderImageCollectionsAsXML = function (foldername, propertys, filter, sortcolumn, filename) {
        this.getFolderImageCollections(foldername, propertys, filter, sortcolumn, MMDAProject.XML, filename);
    };
    MMDAProject.prototype.getFolderImageCollectionsAsJSON = function (foldername, propertys, filter, sortcolumn, filename) {
        this.getFolderImageCollections(foldername, propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    };
    MMDAProject.prototype.loadAllImageCollectionsAsPromise = function (imagecollections) {
        return when.all(imagecollections.map(function (img) { return mendixplatformsdk_1.loadAsPromise(img); }));
    };
    MMDAProject.prototype.returnFolders = function (loadedfolders, qrypropertys, filter, qrysortcolumns, qryresulttype, filename) {
        var outputobjects = new MMDAO.OutputObjectList();
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
    };
    MMDAProject.prototype.getProjectFolders = function (qrypropertys, filter, qrysortcolumns, qryresulttype, filename) {
        var _this = this;
        this.project.createWorkingCopy().then(function (workingCopy) {
            return workingCopy.model().allFolders();
        })
            .then(function (folders) {
            return folders;
        })
            .done(function (loadedfolders) {
            _this.returnFolders(loadedfolders, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
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
    MMDAProject.prototype.getModuleFolders = function (modulename, qrypropertys, filter, qrysortcolumns, qryresulttype, filename) {
        var _this = this;
        this.project.createWorkingCopy().then(function (workingCopy) {
            return workingCopy.model().findModuleByQualifiedName(modulename);
        })
            .then(function (modul) {
            var folders;
            folders = _this.traverseFoldersForFolders(modul.folders);
            return folders;
        })
            .done(function (loadedfolders) {
            _this.returnFolders(loadedfolders, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
        });
    };
    MMDAProject.prototype.getModuleFoldersAsTXT = function (modulename, propertys, filter, sortcolumn, filename) {
        this.getModuleFolders(modulename, propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    };
    MMDAProject.prototype.getModuleFoldersAsHTML = function (modulename, propertys, filter, sortcolumn, filename) {
        this.getModuleFolders(modulename, propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    };
    MMDAProject.prototype.getModuleFoldersAsXML = function (modulename, propertys, filter, sortcolumn, filename) {
        this.getModuleFolders(modulename, propertys, filter, sortcolumn, MMDAProject.XML, filename);
    };
    MMDAProject.prototype.getModuleFoldersAsJSON = function (modulename, propertys, filter, sortcolumn, filename) {
        this.getModuleFolders(modulename, propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    };
    MMDAProject.prototype.getFolderFolders = function (foldername, qrypropertys, filter, qrysortcolumns, qryresulttype, filename) {
        var _this = this;
        var folderfound = false;
        var searchedfolder;
        this.project.createWorkingCopy().then(function (workingCopy) {
            return workingCopy.model().allFolders();
        })
            .then(function (folders) {
            folders.forEach(function (folder) {
                if (folder.name == foldername) {
                    folderfound = true;
                    searchedfolder = folder;
                }
            });
            if (!folderfound) {
                fs.outputFile(filename, "Ordner mit dem Namen " + foldername + " wurde nicht gefunden");
            }
            var folders;
            folders = _this.traverseFoldersForFolders(searchedfolder.folders);
            return folders;
        })
            .done(function (loadedfolders) {
            _this.returnFolders(loadedfolders, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
        });
    };
    MMDAProject.prototype.getFolderFoldersAsHTML = function (foldername, propertys, filter, sortcolumn, filename) {
        this.getFolderFolders(foldername, propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    };
    MMDAProject.prototype.getFolderFoldersAsTXT = function (foldername, propertys, filter, sortcolumn, filename) {
        this.getFolderFolders(foldername, propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    };
    MMDAProject.prototype.getFolderFoldersAsXML = function (foldername, propertys, filter, sortcolumn, filename) {
        this.getFolderFolders(foldername, propertys, filter, sortcolumn, MMDAProject.XML, filename);
    };
    MMDAProject.prototype.getFolderFoldersAsJSON = function (foldername, propertys, filter, sortcolumn, filename) {
        this.getFolderFolders(foldername, propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    };
    MMDAProject.prototype.returnLayouts = function (loadedlayouts, qrypropertys, filter, qrysortcolumns, qryresulttype, filename) {
        var outputobjects = new MMDAO.OutputObjectList();
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
    };
    MMDAProject.prototype.getProjectLayouts = function (qrypropertys, filter, qrysortcolumns, qryresulttype, filename) {
        var _this = this;
        this.project.createWorkingCopy().then(function (workingCopy) {
            return workingCopy.model().allLayouts();
        })
            .then(function (layouts) {
            return _this.loadAllLayoutsAsPromise(layouts);
        })
            .done(function (loadedlayouts) {
            _this.returnLayouts(loadedlayouts, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
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
    MMDAProject.prototype.getProjectLayoutsAsJSON = function (propertys, filter, sortcolumn, filename) {
        this.getProjectLayouts(propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    };
    MMDAProject.prototype.loadAllLayoutsAsPromise = function (layouts) {
        return when.all(layouts.map(function (lay) { return mendixplatformsdk_1.loadAsPromise(lay); }));
    };
    MMDAProject.prototype.returnMicroflows = function (loadedmicroflows, qrypropertys, filter, qrysortcolumns, qryresulttype, filename) {
        var outputobjects = new MMDAO.OutputObjectList();
        loadedmicroflows.forEach(function (microflow) {
            if (microflow instanceof mendixmodelsdk_1.microflows.Microflow) {
                var microflowadapter = new MMDAA.MicroflowAdapter();
                var propertys = new Array();
                var MMDAobj;
                propertys = microflowadapter.getMicroflowPropertys(microflow, qrypropertys);
                MMDAobj = new MMDAO.OutputObject(propertys, "Microflow");
                if (microflowadapter.filter(MMDAobj, filter)) {
                    outputobjects.addObject(MMDAobj);
                }
            }
            else {
                console.log("Got Microflow which is not instance of microflows.Microflow");
            }
        });
        outputobjects = outputobjects.sort(qrysortcolumns); //Sort Objects
        outputobjects.returnResult(qryresulttype, filename); //Return As Output Type
        console.log("Im Done!!!");
    };
    MMDAProject.prototype.getProjectMicroflows = function (qrypropertys, filter, qrysortcolumns, qryresulttype, filename) {
        var _this = this;
        this.project.createWorkingCopy().then(function (workingCopy) {
            return workingCopy.model().allMicroflows();
        })
            .then(function (microflows) {
            return _this.loadAllMicroflowsAsPromise(microflows);
        })
            .done(function (loadedmicroflows) {
            _this.returnMicroflows(loadedmicroflows, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
        });
    };
    MMDAProject.prototype.getProjectMicroflowsAsHTML = function (propertys, filter, sortcolumn, filename) {
        this.getProjectMicroflows(propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    };
    MMDAProject.prototype.getProjectMicroflowsAsXML = function (propertys, filter, sortcolumn, filename) {
        this.getProjectMicroflows(propertys, filter, sortcolumn, MMDAProject.XML, filename);
    };
    MMDAProject.prototype.getProjectMicroflowsAsTXT = function (propertys, filter, sortcolumn, filename) {
        this.getProjectMicroflows(propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    };
    MMDAProject.prototype.getProjectMicroflowsAsJSON = function (propertys, filter, sortcolumn, filename) {
        this.getProjectMicroflows(propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    };
    MMDAProject.prototype.loadAllMicroflowsAsPromise = function (microflows) {
        return when.all(microflows.map(function (mic) { return mendixplatformsdk_1.loadAsPromise(mic); }));
    };
    MMDAProject.prototype.returnModules = function (loadedmodules, qrypropertys, filter, qrysortcolumns, qryresulttype, filename) {
        var outputobjects = new MMDAO.OutputObjectList();
        loadedmodules.forEach(function (modul) {
            if (modul instanceof mendixmodelsdk_1.projects.Module) {
                var moduleadapter = new MMDAA.ModuleAdapter();
                var propertys = new Array();
                var MMDAobj;
                propertys = moduleadapter.getModulePropertys(modul, qrypropertys);
                MMDAobj = new MMDAO.OutputObject(propertys, "Module"); //Get filtered Documents
                if (moduleadapter.filter(MMDAobj, filter)) {
                    outputobjects.addObject(MMDAobj); //filter object
                }
            }
            else {
                console.log("Got Module which is not instance of projects.Module");
            }
        });
        outputobjects = outputobjects.sort(qrysortcolumns); //Sort Objects
        outputobjects.returnResult(qryresulttype, filename); //Return As Output Type
        console.log("Im Done!!!");
    };
    MMDAProject.prototype.getProjectModules = function (qrypropertys, filter, qrysortcolumns, qryresulttype, filename) {
        var _this = this;
        this.project.createWorkingCopy().then(function (workingCopy) {
            return workingCopy.model().allModules();
        })
            .then(function (modules) {
            return modules;
        })
            .done(function (loadedmodules) {
            _this.returnModules(loadedmodules, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
        });
    };
    MMDAProject.prototype.getProjectModulesAsHTML = function (propertys, filter, sortcolumn, filename) {
        this.getProjectModules(propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    };
    MMDAProject.prototype.getProjectModulesAsXML = function (propertys, filter, sortcolumn, filename) {
        this.getProjectModules(propertys, filter, sortcolumn, MMDAProject.XML, filename);
    };
    MMDAProject.prototype.getProjectModulesAsTXT = function (propertys, filter, sortcolumn, filename) {
        this.getProjectModules(propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    };
    MMDAProject.prototype.getProjectModulesAsJSON = function (propertys, filter, sortcolumn, filename) {
        this.getProjectModules(propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    };
    MMDAProject.prototype.returnPages = function (loadedpages, qrypropertys, filter, qrysortcolumns, qryresulttype, filename) {
        var outputobjects = new MMDAO.OutputObjectList();
        loadedpages.forEach(function (page) {
            if (page instanceof mendixmodelsdk_1.pages.Page) {
                var pageadapter = new MMDAA.PageAdapter();
                var propertys = new Array();
                var MMDAobj;
                propertys = pageadapter.getPagePropertys(page, qrypropertys);
                MMDAobj = new MMDAO.OutputObject(propertys, "Page");
                if (pageadapter.filter(MMDAobj, filter)) {
                    outputobjects.addObject(MMDAobj);
                }
            }
            else {
                console.log("Got Page which is not instance of pages.Page");
            }
        });
        outputobjects = outputobjects.sort(qrysortcolumns); //Sort Objects
        outputobjects.returnResult(qryresulttype, filename); //Return As Output Type
        console.log("Im Done!!!");
    };
    MMDAProject.prototype.getProjectPages = function (qrypropertys, filter, qrysortcolumns, qryresulttype, filename) {
        var _this = this;
        this.project.createWorkingCopy().then(function (workingCopy) {
            return workingCopy.model().allPages();
        })
            .then(function (pages) {
            return _this.loadAllPagesAsPromise(pages);
        })
            .done(function (loadedpages) {
            _this.returnPages(loadedpages, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
        });
    };
    MMDAProject.prototype.getProjectPagesAsHTML = function (propertys, filter, sortcolumn, filename) {
        this.getProjectPages(propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    };
    MMDAProject.prototype.getProjectPagesAsXML = function (propertys, filter, sortcolumn, filename) {
        this.getProjectPages(propertys, filter, sortcolumn, MMDAProject.XML, filename);
    };
    MMDAProject.prototype.getProjectPagesAsTXT = function (propertys, filter, sortcolumn, filename) {
        this.getProjectPages(propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    };
    MMDAProject.prototype.getProjectPagesAsJSON = function (propertys, filter, sortcolumn, filename) {
        this.getProjectPages(propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    };
    MMDAProject.prototype.loadAllPagesAsPromise = function (pages) {
        return when.all(pages.map(function (page) { return mendixplatformsdk_1.loadAsPromise(page); }));
    };
    MMDAProject.prototype.returnRegularExpressions = function (loadedregexes, qrypropertys, filter, qrysortcolumns, qryresulttype, filename) {
        var outputobjects = new MMDAO.OutputObjectList();
        loadedregexes.forEach(function (regex) {
            if (regex instanceof mendixmodelsdk_1.regularexpressions.RegularExpression) {
                var regexadapter = new MMDAA.RegExAdapter();
                var propertys = new Array();
                var MMDAobj;
                propertys = regexadapter.getRegExPropertys(regex, qrypropertys);
                MMDAobj = new MMDAO.OutputObject(propertys, "RegularExpression");
                if (regexadapter.filter(MMDAobj, filter)) {
                    outputobjects.addObject(MMDAobj);
                }
            }
            else {
                console.log("Got RegularExpression which is not instance of regularexpressions.RegularExpression");
            }
        });
        outputobjects = outputobjects.sort(qrysortcolumns); //Sort Objects
        outputobjects.returnResult(qryresulttype, filename); //Return As Output Type
        console.log("Im Done!!!");
    };
    MMDAProject.prototype.getProjectRegularExpressions = function (qrypropertys, filter, qrysortcolumns, qryresulttype, filename) {
        var _this = this;
        this.project.createWorkingCopy().then(function (workingCopy) {
            return workingCopy.model().allRegularExpressions();
        })
            .then(function (regexes) {
            return _this.loadAllRegularExpressionsAsPromise(regexes);
        })
            .done(function (loadedregexes) {
            _this.returnRegularExpressions(loadedregexes, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
        });
    };
    MMDAProject.prototype.getProjectRegularExpressionsAsHTML = function (propertys, filter, sortcolumn, filename) {
        this.getProjectRegularExpressions(propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    };
    MMDAProject.prototype.getProjectRegularExpressionsAsXML = function (propertys, filter, sortcolumn, filename) {
        this.getProjectRegularExpressions(propertys, filter, sortcolumn, MMDAProject.XML, filename);
    };
    MMDAProject.prototype.getProjectRegularExpressionsAsTXT = function (propertys, filter, sortcolumn, filename) {
        this.getProjectRegularExpressions(propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    };
    MMDAProject.prototype.getProjectRegularExpressionsAsJSON = function (propertys, filter, sortcolumn, filename) {
        this.getProjectRegularExpressions(propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    };
    MMDAProject.prototype.loadAllRegularExpressionsAsPromise = function (regex) {
        return when.all(regex.map(function (reg) { return mendixplatformsdk_1.loadAsPromise(reg); }));
    };
    MMDAProject.prototype.returnSnippets = function (loadedsnippets, qrypropertys, filter, qrysortcolumns, qryresulttype, filename) {
        var outputobjects = new MMDAO.OutputObjectList();
        loadedsnippets.forEach(function (snippet) {
            if (snippet instanceof mendixmodelsdk_1.pages.Snippet) {
                var snippetadapter = new MMDAA.SnippetAdapter();
                var propertys = new Array();
                var MMDAobj;
                propertys = snippetadapter.getSnippetPropertys(snippet, qrypropertys);
                MMDAobj = new MMDAO.OutputObject(propertys, "Snippet");
                if (snippetadapter.filter(MMDAobj, filter)) {
                    outputobjects.addObject(MMDAobj);
                }
            }
            else {
                console.log("Got Snippet which is not instance of pages.Snippet");
            }
        });
        outputobjects = outputobjects.sort(qrysortcolumns); //Sort Objects
        outputobjects.returnResult(qryresulttype, filename); //Return As Output Type
        console.log("Im Done!!!");
    };
    MMDAProject.prototype.getProjectSnippets = function (qrypropertys, filter, qrysortcolumns, qryresulttype, filename) {
        var _this = this;
        this.project.createWorkingCopy().then(function (workingCopy) {
            return workingCopy.model().allSnippets();
        })
            .then(function (snippets) {
            return _this.loadAllSnippetsAsPromise(snippets);
        })
            .done(function (loadedsnippets) {
            _this.returnSnippets(loadedsnippets, qrypropertys, filter, qrysortcolumns, qryresulttype, filename);
        });
    };
    MMDAProject.prototype.getProjectSnippetsAsHTML = function (propertys, filter, sortcolumn, filename) {
        this.getProjectSnippets(propertys, filter, sortcolumn, MMDAProject.HTMLTABLE, filename);
    };
    MMDAProject.prototype.getProjectSnippetsAsXML = function (propertys, filter, sortcolumn, filename) {
        this.getProjectSnippets(propertys, filter, sortcolumn, MMDAProject.XML, filename);
    };
    MMDAProject.prototype.getProjectSnippetsAsTXT = function (propertys, filter, sortcolumn, filename) {
        this.getProjectSnippets(propertys, filter, sortcolumn, MMDAProject.TEXTFILE, filename);
    };
    MMDAProject.prototype.getProjectSnippetsAsJSON = function (propertys, filter, sortcolumn, filename) {
        this.getProjectSnippets(propertys, filter, sortcolumn, MMDAProject.JSON, filename);
    };
    MMDAProject.prototype.loadAllSnippetsAsPromise = function (snippet) {
        return when.all(snippet.map(function (snip) { return mendixplatformsdk_1.loadAsPromise(snip); }));
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
