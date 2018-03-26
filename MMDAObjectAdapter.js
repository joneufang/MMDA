"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var mendixmodelsdk_1 = require("mendixmodelsdk");
var MMDAO = require("./MMDAOutputObject");
var qrycons = require("./MMDAQueryConstants");
//Adapter to get propertys and filter Mendix Objects
var StructureAdapter = /** @class */ (function () {
    function StructureAdapter() {
    }
    //Get Id of Mendix Object
    StructureAdapter.prototype.getId = function (structure) {
        var property;
        property = new MMDAO.OutputObjectProperty(qrycons.documents.ID, structure.id);
        return property;
    };
    //Get Type of Mendix Object
    StructureAdapter.prototype.getType = function (structure) {
        var property;
        property = new MMDAO.OutputObjectProperty(qrycons.documents.TYPE, structure.structureTypeName);
        return property;
    };
    //Get Container of Mendix Object
    StructureAdapter.prototype.getContainer = function (structure) {
        var property;
        var container = "Kein Container";
        try {
            var fbase = structure.container;
            if (fbase instanceof mendixmodelsdk_1.projects.Folder) {
                var folder = fbase;
                container = folder.name;
            }
            else if (fbase instanceof mendixmodelsdk_1.projects.Module) {
                var modul = fbase;
                container = modul.name;
            }
        }
        catch (error) {
        }
        property = new MMDAO.OutputObjectProperty(qrycons.documents.CONTAINER, container);
        return property;
    };
    //Filters Output Object
    //Returns true if Object passes all filters
    StructureAdapter.prototype.filter = function (MMDAobject, filter) {
        var filtered = true;
        var filtercount = 0;
        filter.forEach(function (qryfilter) {
            //onsole.log("FilterType: " + qryfilter.getType)
            var regex = qryfilter.getValue();
            var value = MMDAobject.getPropertyValue(qryfilter.getType());
            if (!(value.match(regex) || regex == value)) {
                filtered = false;
            }
            filtercount++;
        });
        return filtered;
    };
    return StructureAdapter;
}());
exports.StructureAdapter = StructureAdapter;
var AbstractElementAdapter = /** @class */ (function (_super) {
    __extends(AbstractElementAdapter, _super);
    function AbstractElementAdapter() {
        return _super.call(this) || this;
    }
    return AbstractElementAdapter;
}(StructureAdapter));
exports.AbstractElementAdapter = AbstractElementAdapter;
var AbstractUnitAdapter = /** @class */ (function (_super) {
    __extends(AbstractUnitAdapter, _super);
    function AbstractUnitAdapter() {
        return _super.call(this) || this;
    }
    return AbstractUnitAdapter;
}(StructureAdapter));
exports.AbstractUnitAdapter = AbstractUnitAdapter;
var StructuralUnitAdapter = /** @class */ (function (_super) {
    __extends(StructuralUnitAdapter, _super);
    function StructuralUnitAdapter() {
        return _super.call(this) || this;
    }
    return StructuralUnitAdapter;
}(AbstractUnitAdapter));
exports.StructuralUnitAdapter = StructuralUnitAdapter;
var FolderBaseAdapter = /** @class */ (function (_super) {
    __extends(FolderBaseAdapter, _super);
    function FolderBaseAdapter() {
        return _super.call(this) || this;
    }
    return FolderBaseAdapter;
}(StructuralUnitAdapter));
exports.FolderBaseAdapter = FolderBaseAdapter;
var ModuleDocumentAdapter = /** @class */ (function (_super) {
    __extends(ModuleDocumentAdapter, _super);
    function ModuleDocumentAdapter() {
        return _super.call(this) || this;
    }
    return ModuleDocumentAdapter;
}(AbstractElementAdapter));
exports.ModuleDocumentAdapter = ModuleDocumentAdapter;
var DomainModelAdapter = /** @class */ (function (_super) {
    __extends(DomainModelAdapter, _super);
    function DomainModelAdapter() {
        return _super.call(this) || this;
    }
    DomainModelAdapter.prototype.getDomainModelPropertys = function (domainmodel, qrypropertys) {
        var _this = this;
        var propertys = new Array();
        if (qrypropertys[0] == qrycons.domainmodels.ALL) {
            propertys[propertys.length] = this.getId(domainmodel);
            propertys[propertys.length] = this.getType(domainmodel);
            propertys[propertys.length] = this.getContainer(domainmodel);
            propertys[propertys.length] = this.getDocumentation(domainmodel);
            propertys[propertys.length] = this.getEntities(domainmodel);
            propertys[propertys.length] = this.getAssociations(domainmodel);
        }
        else {
            qrypropertys.forEach(function (qryprop) {
                if (qryprop == qrycons.domainmodels.ID) {
                    propertys[propertys.length] = _this.getId(domainmodel);
                }
                else if (qryprop == qrycons.domainmodels.TYPE) {
                    propertys[propertys.length] = _this.getType(domainmodel);
                }
                else if (qryprop == qrycons.domainmodels.CONTAINER) {
                    propertys[propertys.length] = _this.getContainer(domainmodel);
                }
                else if (qryprop == qrycons.domainmodels.DOCUMENTATION) {
                    propertys[propertys.length] = _this.getDocumentation(domainmodel);
                }
                else if (qryprop == qrycons.domainmodels.ENTITIES) {
                    propertys[propertys.length] = _this.getEntities(domainmodel);
                }
                else if (qryprop == qrycons.domainmodels.ASSOCIATIONS) {
                    propertys[propertys.length] = _this.getAssociations(domainmodel);
                }
                else {
                    propertys[propertys.length] = new MMDAO.OutputObjectProperty("Unknown Property", "Value of Unknown Property");
                }
            });
        }
        return propertys;
    };
    DomainModelAdapter.prototype.getDocumentation = function (domainmodel) {
        var property;
        property = new MMDAO.OutputObjectProperty(qrycons.domainmodels.DOCUMENTATION, "No Value loaded"); //Muss noch richtig implementiert werden aktuell überall No Value muss mit .load(callback) geladen werden.
        if (domainmodel.isLoaded) {
            var docu = domainmodel.documentation;
            docu = docu.replace(/\r/g, "");
            docu = docu.replace(/\n/g, "\t");
            if (docu == "") {
                property = new MMDAO.OutputObjectProperty(qrycons.domainmodels.DOCUMENTATION, "No Documentation");
            }
            else {
                property = new MMDAO.OutputObjectProperty(qrycons.domainmodels.DOCUMENTATION, docu);
            }
        }
        return property;
    };
    DomainModelAdapter.prototype.getEntities = function (domainmodel) {
        var property;
        var result = "";
        domainmodel.entities.forEach(function (entity) {
            result += entity.qualifiedName + ", ";
        });
        //console.log("Entities: " + result + "\n");
        property = new MMDAO.OutputObjectProperty(qrycons.domainmodels.ENTITIES, result);
        return property;
    };
    DomainModelAdapter.prototype.getAssociations = function (domainmodel) {
        var property;
        var result = "";
        domainmodel.associations.forEach(function (associ) {
            result += associ.qualifiedName + ", ";
        });
        //console.log("Associations: " + result + "\n");
        property = new MMDAO.OutputObjectProperty(qrycons.domainmodels.ASSOCIATIONS, result);
        return property;
    };
    return DomainModelAdapter;
}(ModuleDocumentAdapter));
exports.DomainModelAdapter = DomainModelAdapter;
//Adapter to get propertys of Mendix Documents
var DocumentAdapter = /** @class */ (function (_super) {
    __extends(DocumentAdapter, _super);
    function DocumentAdapter() {
        return _super.call(this) || this;
    }
    //Gets all wanted propertys from a Mendix Document
    //Returns Array of Output Object Properties
    DocumentAdapter.prototype.getDocumentPropertys = function (document, qrypropertys) {
        var _this = this;
        var propertys = new Array();
        if (qrypropertys[0] == qrycons.documents.ALL) {
            propertys[propertys.length] = this.getId(document);
            propertys[propertys.length] = this.getName(document);
            propertys[propertys.length] = this.getType(document);
            propertys[propertys.length] = this.getContainer(document);
            propertys[propertys.length] = this.getDocumentation(document);
        }
        else {
            qrypropertys.forEach(function (qryprop) {
                if (qryprop == qrycons.documents.ID) {
                    propertys[propertys.length] = _this.getId(document);
                }
                else if (qryprop == qrycons.documents.NAME) {
                    propertys[propertys.length] = _this.getName(document);
                }
                else if (qryprop == qrycons.documents.TYPE) {
                    propertys[propertys.length] = _this.getType(document);
                }
                else if (qryprop == qrycons.documents.CONTAINER) {
                    propertys[propertys.length] = _this.getContainer(document);
                }
                else if (qryprop == qrycons.documents.DOCUMENTATION) {
                    propertys[propertys.length] = _this.getDocumentation(document);
                }
                else {
                    propertys[propertys.length] = new MMDAO.OutputObjectProperty("Unknown Property", "Value of Unknown Property");
                }
            });
        }
        return propertys;
    };
    //gets Name of a Mendix Document
    DocumentAdapter.prototype.getName = function (document) {
        var property;
        property = new MMDAO.OutputObjectProperty(qrycons.documents.NAME, document.qualifiedName);
        return property;
    };
    //gets Documentation of a Mendix Document
    DocumentAdapter.prototype.getDocumentation = function (document) {
        var property;
        property = new MMDAO.OutputObjectProperty(qrycons.documents.DOCUMENTATION, "No Value loaded"); //Muss noch richtig implementiert werden aktuell überall No Value muss mit .load(callback) geladen werden.
        if (document.isLoaded) {
            var docu = document.documentation;
            docu = docu.replace(/\r/g, "");
            docu = docu.replace(/\n/g, "\t");
            if (docu == "") {
                property = new MMDAO.OutputObjectProperty(qrycons.documents.DOCUMENTATION, "No Documentation");
            }
            else {
                property = new MMDAO.OutputObjectProperty(qrycons.documents.DOCUMENTATION, docu);
            }
        }
        return property;
    };
    return DocumentAdapter;
}(ModuleDocumentAdapter));
exports.DocumentAdapter = DocumentAdapter;
var ConstantAdapter = /** @class */ (function (_super) {
    __extends(ConstantAdapter, _super);
    function ConstantAdapter() {
        return _super.call(this) || this;
    }
    ConstantAdapter.prototype.getConstantPropertys = function (constant, qrypropertys) {
        var _this = this;
        var propertys = new Array();
        if (qrypropertys[0] == qrycons.constants.ALL) {
            propertys[propertys.length] = this.getId(constant);
            propertys[propertys.length] = this.getName(constant);
            propertys[propertys.length] = this.getType(constant);
            propertys[propertys.length] = this.getContainer(constant);
            propertys[propertys.length] = this.getDataType(constant);
            propertys[propertys.length] = this.getDataValue(constant);
            propertys[propertys.length] = this.getDocumentation(constant);
        }
        else {
            qrypropertys.forEach(function (qryprop) {
                if (qryprop == qrycons.constants.ID) {
                    propertys[propertys.length] = _this.getId(constant);
                }
                else if (qryprop == qrycons.constants.NAME) {
                    propertys[propertys.length] = _this.getName(constant);
                }
                else if (qryprop == qrycons.constants.TYPE) {
                    propertys[propertys.length] = _this.getType(constant);
                }
                else if (qryprop == qrycons.constants.CONTAINER) {
                    propertys[propertys.length] = _this.getContainer(constant);
                }
                else if (qryprop == qrycons.constants.DATATYPE) {
                    propertys[propertys.length] = _this.getDataType(constant);
                }
                else if (qryprop == qrycons.constants.DATAVALUE) {
                    propertys[propertys.length] = _this.getDataValue(constant);
                }
                else if (qryprop == qrycons.constants.DOCUMENTATION) {
                    propertys[propertys.length] = _this.getDocumentation(constant);
                }
                else {
                    propertys[propertys.length] = new MMDAO.OutputObjectProperty("Unknown Property", "Value of Unknown Property");
                }
            });
        }
        return propertys;
    };
    ConstantAdapter.prototype.getDataType = function (constant) {
        var property;
        property = new MMDAO.OutputObjectProperty(qrycons.constants.DATATYPE, constant.dataType);
        return property;
    };
    ConstantAdapter.prototype.getDataValue = function (constant) {
        var property;
        property = new MMDAO.OutputObjectProperty(qrycons.constants.DATAVALUE, constant.defaultValue);
        return property;
    };
    return ConstantAdapter;
}(DocumentAdapter));
exports.ConstantAdapter = ConstantAdapter;
var EnumerationAdapter = /** @class */ (function (_super) {
    __extends(EnumerationAdapter, _super);
    function EnumerationAdapter() {
        return _super.call(this) || this;
    }
    EnumerationAdapter.prototype.getEnumerationPropertys = function (enumeration, qrypropertys) {
        var _this = this;
        var propertys = new Array();
        if (qrypropertys[0] == qrycons.enumerations.ALL) {
            propertys[propertys.length] = this.getId(enumeration);
            propertys[propertys.length] = this.getName(enumeration);
            propertys[propertys.length] = this.getType(enumeration);
            propertys[propertys.length] = this.getValues(enumeration);
            propertys[propertys.length] = this.getContainer(enumeration);
            propertys[propertys.length] = this.getDocumentation(enumeration);
        }
        else {
            qrypropertys.forEach(function (qryprop) {
                if (qryprop == qrycons.enumerations.ID) {
                    propertys[propertys.length] = _this.getId(enumeration);
                }
                else if (qryprop == qrycons.enumerations.NAME) {
                    propertys[propertys.length] = _this.getName(enumeration);
                }
                else if (qryprop == qrycons.enumerations.TYPE) {
                    propertys[propertys.length] = _this.getType(enumeration);
                }
                else if (qryprop == qrycons.enumerations.VALUES) {
                    propertys[propertys.length] = _this.getValues(enumeration);
                }
                else if (qryprop == qrycons.enumerations.CONTAINER) {
                    propertys[propertys.length] = _this.getContainer(enumeration);
                }
                else if (qryprop == qrycons.enumerations.DOCUMENTATION) {
                    propertys[propertys.length] = _this.getDocumentation(enumeration);
                }
                else {
                    propertys[propertys.length] = new MMDAO.OutputObjectProperty("Unknown Property", "Value of Unknown Property");
                }
            });
        }
        return propertys;
    };
    EnumerationAdapter.prototype.getValues = function (enumeration) {
        var property;
        var result = "";
        enumeration.values.forEach(function (value) {
            result += value.name + ", ";
        });
        property = new MMDAO.OutputObjectProperty(qrycons.enumerations.VALUES, result);
        return property;
    };
    return EnumerationAdapter;
}(DocumentAdapter));
exports.EnumerationAdapter = EnumerationAdapter;
var ImageCollectionAdapter = /** @class */ (function (_super) {
    __extends(ImageCollectionAdapter, _super);
    function ImageCollectionAdapter() {
        return _super.call(this) || this;
    }
    ImageCollectionAdapter.prototype.getImageCollectionPropertys = function (imagecollection, qrypropertys) {
        var _this = this;
        var propertys = new Array();
        if (qrypropertys[0] == qrycons.imagecollections.ALL) {
            propertys[propertys.length] = this.getId(imagecollection);
            propertys[propertys.length] = this.getName(imagecollection);
            propertys[propertys.length] = this.getType(imagecollection);
            propertys[propertys.length] = this.getImages(imagecollection);
            propertys[propertys.length] = this.getContainer(imagecollection);
            propertys[propertys.length] = this.getDocumentation(imagecollection);
        }
        else {
            qrypropertys.forEach(function (qryprop) {
                if (qryprop == qrycons.imagecollections.ID) {
                    propertys[propertys.length] = _this.getId(imagecollection);
                }
                else if (qryprop == qrycons.imagecollections.NAME) {
                    propertys[propertys.length] = _this.getName(imagecollection);
                }
                else if (qryprop == qrycons.imagecollections.TYPE) {
                    propertys[propertys.length] = _this.getType(imagecollection);
                }
                else if (qryprop == qrycons.imagecollections.IMAGES) {
                    propertys[propertys.length] = _this.getImages(imagecollection);
                }
                else if (qryprop == qrycons.imagecollections.IMAGES) {
                    propertys[propertys.length] = _this.getContainer(imagecollection);
                }
                else if (qryprop == qrycons.imagecollections.DOCUMENTATION) {
                    propertys[propertys.length] = _this.getDocumentation(imagecollection);
                }
                else {
                    propertys[propertys.length] = new MMDAO.OutputObjectProperty("Unknown Property", "Value of Unknown Property");
                }
            });
        }
        return propertys;
    };
    ImageCollectionAdapter.prototype.getImages = function (imagecollection) {
        var property;
        var result = "";
        imagecollection.images.forEach(function (img) {
            result += img.qualifiedName + ", ";
        });
        property = new MMDAO.OutputObjectProperty(qrycons.imagecollections.IMAGES, result);
        return property;
    };
    return ImageCollectionAdapter;
}(DocumentAdapter));
exports.ImageCollectionAdapter = ImageCollectionAdapter;
var FolderAdapter = /** @class */ (function (_super) {
    __extends(FolderAdapter, _super);
    function FolderAdapter() {
        return _super.call(this) || this;
    }
    FolderAdapter.prototype.getFolderPropertys = function (folder, qrypropertys) {
        var _this = this;
        var propertys = new Array();
        if (qrypropertys[0] == qrycons.folders.ALL) {
            propertys[propertys.length] = this.getId(folder);
            propertys[propertys.length] = this.getName(folder);
            propertys[propertys.length] = this.getType(folder);
            propertys[propertys.length] = this.getContainer(folder);
            propertys[propertys.length] = this.getDocuments(folder);
            propertys[propertys.length] = this.getSubFolders(folder);
        }
        else {
            qrypropertys.forEach(function (qryprop) {
                if (qryprop == qrycons.folders.ID) {
                    propertys[propertys.length] = _this.getId(folder);
                }
                else if (qryprop == qrycons.folders.NAME) {
                    propertys[propertys.length] = _this.getName(folder);
                }
                else if (qryprop == qrycons.folders.TYPE) {
                    propertys[propertys.length] = _this.getType(folder);
                }
                else if (qryprop == qrycons.folders.CONTAINER) {
                    propertys[propertys.length] = _this.getContainer(folder);
                }
                else if (qryprop == qrycons.folders.SUBFOLDERS) {
                    propertys[propertys.length] = _this.getSubFolders(folder);
                }
                else if (qryprop == qrycons.folders.DOCUMENTS) {
                    propertys[propertys.length] = _this.getDocuments(folder);
                }
                else {
                    propertys[propertys.length] = new MMDAO.OutputObjectProperty("Unknown Property", "Value of Unknown Property");
                }
            });
        }
        return propertys;
    };
    FolderAdapter.prototype.getDocuments = function (folder) {
        var property;
        var result = "";
        folder.documents.forEach(function (doc) {
            result += doc.qualifiedName + ", ";
        });
        property = new MMDAO.OutputObjectProperty(qrycons.folders.DOCUMENTS, result);
        return property;
    };
    FolderAdapter.prototype.getSubFolders = function (folder) {
        var property;
        var result = "";
        folder.folders.forEach(function (fold) {
            result += fold.name + ", ";
        });
        property = new MMDAO.OutputObjectProperty(qrycons.folders.SUBFOLDERS, result);
        return property;
    };
    FolderAdapter.prototype.getName = function (folder) {
        var property;
        property = new MMDAO.OutputObjectProperty(qrycons.documents.NAME, folder.name);
        return property;
    };
    return FolderAdapter;
}(FolderBaseAdapter));
exports.FolderAdapter = FolderAdapter;
