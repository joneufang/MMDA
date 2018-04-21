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
var FormBaseAdapter = /** @class */ (function (_super) {
    __extends(FormBaseAdapter, _super);
    function FormBaseAdapter() {
        return _super.call(this) || this;
    }
    return FormBaseAdapter;
}(DocumentAdapter));
exports.FormBaseAdapter = FormBaseAdapter;
var MicroflowBaseAdapter = /** @class */ (function (_super) {
    __extends(MicroflowBaseAdapter, _super);
    function MicroflowBaseAdapter() {
        return _super.call(this) || this;
    }
    return MicroflowBaseAdapter;
}(DocumentAdapter));
exports.MicroflowBaseAdapter = MicroflowBaseAdapter;
var ServersideMicroflowAdapter = /** @class */ (function (_super) {
    __extends(ServersideMicroflowAdapter, _super);
    function ServersideMicroflowAdapter() {
        return _super.call(this) || this;
    }
    return ServersideMicroflowAdapter;
}(MicroflowBaseAdapter));
exports.ServersideMicroflowAdapter = ServersideMicroflowAdapter;
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
                else if (qryprop == qrycons.imagecollections.CONTAINER) {
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
var LayoutAdapter = /** @class */ (function (_super) {
    __extends(LayoutAdapter, _super);
    function LayoutAdapter() {
        return _super.call(this) || this;
    }
    LayoutAdapter.prototype.getLayoutPropertys = function (layout, qrypropertys) {
        var _this = this;
        var propertys = new Array();
        if (qrypropertys[0] == qrycons.layouts.ALL) {
            propertys[propertys.length] = this.getId(layout);
            propertys[propertys.length] = this.getName(layout);
            propertys[propertys.length] = this.getType(layout);
            propertys[propertys.length] = this.getContainer(layout);
            propertys[propertys.length] = this.getLayoutType(layout);
            propertys[propertys.length] = this.getDocumentation(layout);
        }
        else {
            qrypropertys.forEach(function (qryprop) {
                if (qryprop == qrycons.layouts.ID) {
                    propertys[propertys.length] = _this.getId(layout);
                }
                else if (qryprop == qrycons.layouts.NAME) {
                    propertys[propertys.length] = _this.getName(layout);
                }
                else if (qryprop == qrycons.layouts.TYPE) {
                    propertys[propertys.length] = _this.getType(layout);
                }
                else if (qryprop == qrycons.layouts.CONTAINER) {
                    propertys[propertys.length] = _this.getContainer(layout);
                }
                else if (qryprop == qrycons.layouts.LAYOUTTYPE) {
                    propertys[propertys.length] = _this.getLayoutType(layout);
                }
                else if (qryprop == qrycons.layouts.DOCUMENTATION) {
                    propertys[propertys.length] = _this.getDocumentation(layout);
                }
                else {
                    propertys[propertys.length] = new MMDAO.OutputObjectProperty("Unknown Property", "Value of Unknown Property");
                }
            });
        }
        return propertys;
    };
    LayoutAdapter.prototype.getLayoutType = function (layout) {
        var property;
        property = new MMDAO.OutputObjectProperty(qrycons.layouts.LAYOUTTYPE, layout.layoutType.name);
        return property;
    };
    return LayoutAdapter;
}(DocumentAdapter));
exports.LayoutAdapter = LayoutAdapter;
var MicroflowAdapter = /** @class */ (function (_super) {
    __extends(MicroflowAdapter, _super);
    function MicroflowAdapter() {
        return _super.call(this) || this;
    }
    MicroflowAdapter.prototype.getMicroflowPropertys = function (microflow, qrypropertys) {
        var _this = this;
        var propertys = new Array();
        if (qrypropertys[0] == qrycons.microflows.ALL) {
            propertys[propertys.length] = this.getId(microflow);
            propertys[propertys.length] = this.getName(microflow);
            propertys[propertys.length] = this.getType(microflow);
            propertys[propertys.length] = this.getContainer(microflow);
            propertys[propertys.length] = this.getReturnType(microflow);
            propertys[propertys.length] = this.getDocumentation(microflow);
        }
        else {
            qrypropertys.forEach(function (qryprop) {
                if (qryprop == qrycons.microflows.ID) {
                    propertys[propertys.length] = _this.getId(microflow);
                }
                else if (qryprop == qrycons.microflows.NAME) {
                    propertys[propertys.length] = _this.getName(microflow);
                }
                else if (qryprop == qrycons.microflows.TYPE) {
                    propertys[propertys.length] = _this.getType(microflow);
                }
                else if (qryprop == qrycons.microflows.CONTAINER) {
                    propertys[propertys.length] = _this.getContainer(microflow);
                }
                else if (qryprop == qrycons.microflows.RETURNTYPE) {
                    propertys[propertys.length] = _this.getReturnType(microflow);
                }
                else if (qryprop == qrycons.microflows.DOCUMENTATION) {
                    propertys[propertys.length] = _this.getDocumentation(microflow);
                }
                else {
                    propertys[propertys.length] = new MMDAO.OutputObjectProperty("Unknown Property", "Value of Unknown Property");
                }
            });
        }
        return propertys;
    };
    MicroflowAdapter.prototype.getReturnType = function (microflow) {
        var property;
        property = new MMDAO.OutputObjectProperty(qrycons.microflows.RETURNTYPE, microflow.returnType);
        return property;
    };
    return MicroflowAdapter;
}(ServersideMicroflowAdapter));
exports.MicroflowAdapter = MicroflowAdapter;
var ModuleAdapter = /** @class */ (function (_super) {
    __extends(ModuleAdapter, _super);
    function ModuleAdapter() {
        return _super.call(this) || this;
    }
    ModuleAdapter.prototype.getModulePropertys = function (modul, qrypropertys) {
        var _this = this;
        var propertys = new Array();
        if (qrypropertys[0] == qrycons.modules.ALL) {
            propertys[propertys.length] = this.getId(modul);
            propertys[propertys.length] = this.getName(modul);
            propertys[propertys.length] = this.getType(modul);
            propertys[propertys.length] = this.getContainer(modul);
            propertys[propertys.length] = this.getDocuments(modul);
            propertys[propertys.length] = this.getFolders(modul);
        }
        else {
            qrypropertys.forEach(function (qryprop) {
                if (qryprop == qrycons.modules.ID) {
                    propertys[propertys.length] = _this.getId(modul);
                }
                else if (qryprop == qrycons.modules.NAME) {
                    propertys[propertys.length] = _this.getName(modul);
                }
                else if (qryprop == qrycons.modules.TYPE) {
                    propertys[propertys.length] = _this.getType(modul);
                }
                else if (qryprop == qrycons.modules.FOLDERS) {
                    propertys[propertys.length] = _this.getFolders(modul);
                }
                else if (qryprop == qrycons.modules.DOCUMENTS) {
                    propertys[propertys.length] = _this.getDocuments(modul);
                }
                else {
                    propertys[propertys.length] = new MMDAO.OutputObjectProperty("Unknown Property", "Value of Unknown Property");
                }
            });
        }
        return propertys;
    };
    ModuleAdapter.prototype.getDocuments = function (modul) {
        var property;
        var result = "";
        modul.documents.forEach(function (doc) {
            result += doc.qualifiedName + ", ";
        });
        property = new MMDAO.OutputObjectProperty(qrycons.modules.DOCUMENTS, result);
        return property;
    };
    ModuleAdapter.prototype.getFolders = function (modul) {
        var property;
        var result = "";
        modul.folders.forEach(function (fold) {
            result += fold.name + ", ";
        });
        property = new MMDAO.OutputObjectProperty(qrycons.modules.FOLDERS, result);
        return property;
    };
    ModuleAdapter.prototype.getName = function (modul) {
        var property;
        property = new MMDAO.OutputObjectProperty(qrycons.modules.NAME, modul.name);
        return property;
    };
    return ModuleAdapter;
}(FolderBaseAdapter));
exports.ModuleAdapter = ModuleAdapter;
var PageAdapter = /** @class */ (function (_super) {
    __extends(PageAdapter, _super);
    function PageAdapter() {
        return _super.call(this) || this;
    }
    PageAdapter.prototype.getPagePropertys = function (page, qrypropertys) {
        var _this = this;
        var propertys = new Array();
        if (qrypropertys[0] == qrycons.pages.ALL) {
            propertys[propertys.length] = this.getId(page);
            propertys[propertys.length] = this.getName(page);
            propertys[propertys.length] = this.getType(page);
            propertys[propertys.length] = this.getContainer(page);
            propertys[propertys.length] = this.getLayout(page);
            propertys[propertys.length] = this.getAllowedRoles(page);
            propertys[propertys.length] = this.getURL(page);
            propertys[propertys.length] = this.getDocumentation(page);
        }
        else {
            qrypropertys.forEach(function (qryprop) {
                if (qryprop == qrycons.pages.ID) {
                    propertys[propertys.length] = _this.getId(page);
                }
                else if (qryprop == qrycons.pages.NAME) {
                    propertys[propertys.length] = _this.getName(page);
                }
                else if (qryprop == qrycons.pages.TYPE) {
                    propertys[propertys.length] = _this.getType(page);
                }
                else if (qryprop == qrycons.pages.CONTAINER) {
                    propertys[propertys.length] = _this.getContainer(page);
                }
                else if (qryprop == qrycons.pages.LAYOUT) {
                    propertys[propertys.length] = _this.getLayout(page);
                }
                else if (qryprop == qrycons.pages.ALLOWEDROLES) {
                    propertys[propertys.length] = _this.getAllowedRoles(page);
                }
                else if (qryprop == qrycons.pages.URL) {
                    propertys[propertys.length] = _this.getURL(page);
                }
                else if (qryprop == qrycons.pages.DOCUMENTATION) {
                    propertys[propertys.length] = _this.getDocumentation(page);
                }
                else {
                    propertys[propertys.length] = new MMDAO.OutputObjectProperty("Unknown Property", "Value of Unknown Property");
                }
            });
        }
        return propertys;
    };
    PageAdapter.prototype.getLayout = function (page) {
        var property;
        property = new MMDAO.OutputObjectProperty(qrycons.pages.LAYOUT, page.layoutCall.layoutQualifiedName);
        return property;
    };
    PageAdapter.prototype.getAllowedRoles = function (page) {
        var property;
        var result = "";
        page.allowedRoles.forEach(function (role) {
            result += role.qualifiedName + ", ";
        });
        property = new MMDAO.OutputObjectProperty(qrycons.pages.ALLOWEDROLES, result);
        return property;
    };
    PageAdapter.prototype.getURL = function (page) {
        var property;
        property = new MMDAO.OutputObjectProperty(qrycons.pages.URL, page.url);
        return property;
    };
    return PageAdapter;
}(DocumentAdapter));
exports.PageAdapter = PageAdapter;
var RegExAdapter = /** @class */ (function (_super) {
    __extends(RegExAdapter, _super);
    function RegExAdapter() {
        return _super.call(this) || this;
    }
    RegExAdapter.prototype.getRegExPropertys = function (regex, qrypropertys) {
        var _this = this;
        var propertys = new Array();
        if (qrypropertys[0] == qrycons.constants.ALL) {
            propertys[propertys.length] = this.getId(regex);
            propertys[propertys.length] = this.getName(regex);
            propertys[propertys.length] = this.getType(regex);
            propertys[propertys.length] = this.getContainer(regex);
            propertys[propertys.length] = this.getRegEx(regex);
            propertys[propertys.length] = this.getDocumentation(regex);
        }
        else {
            qrypropertys.forEach(function (qryprop) {
                if (qryprop == qrycons.regularexpressions.ID) {
                    propertys[propertys.length] = _this.getId(regex);
                }
                else if (qryprop == qrycons.regularexpressions.NAME) {
                    propertys[propertys.length] = _this.getName(regex);
                }
                else if (qryprop == qrycons.regularexpressions.TYPE) {
                    propertys[propertys.length] = _this.getType(regex);
                }
                else if (qryprop == qrycons.regularexpressions.CONTAINER) {
                    propertys[propertys.length] = _this.getContainer(regex);
                }
                else if (qryprop == qrycons.regularexpressions.REGEX) {
                    propertys[propertys.length] = _this.getRegEx(regex);
                }
                else if (qryprop == qrycons.regularexpressions.DOCUMENTATION) {
                    propertys[propertys.length] = _this.getDocumentation(regex);
                }
                else {
                    propertys[propertys.length] = new MMDAO.OutputObjectProperty("Unknown Property", "Value of Unknown Property");
                }
            });
        }
        return propertys;
    };
    RegExAdapter.prototype.getRegEx = function (regex) {
        var property;
        property = new MMDAO.OutputObjectProperty(qrycons.regularexpressions.REGEX, regex.regEx);
        return property;
    };
    return RegExAdapter;
}(DocumentAdapter));
exports.RegExAdapter = RegExAdapter;
var SnippetAdapter = /** @class */ (function (_super) {
    __extends(SnippetAdapter, _super);
    function SnippetAdapter() {
        return _super.call(this) || this;
    }
    SnippetAdapter.prototype.getSnippetPropertys = function (snippet, qrypropertys) {
        var _this = this;
        var propertys = new Array();
        if (qrypropertys[0] == qrycons.snippets.ALL) {
            propertys[propertys.length] = this.getId(snippet);
            propertys[propertys.length] = this.getName(snippet);
            propertys[propertys.length] = this.getType(snippet);
            propertys[propertys.length] = this.getContainer(snippet);
            propertys[propertys.length] = this.getEntity(snippet);
            propertys[propertys.length] = this.getDocumentation(snippet);
        }
        else {
            qrypropertys.forEach(function (qryprop) {
                if (qryprop == qrycons.snippets.ID) {
                    propertys[propertys.length] = _this.getId(snippet);
                }
                else if (qryprop == qrycons.snippets.NAME) {
                    propertys[propertys.length] = _this.getName(snippet);
                }
                else if (qryprop == qrycons.snippets.TYPE) {
                    propertys[propertys.length] = _this.getType(snippet);
                }
                else if (qryprop == qrycons.snippets.CONTAINER) {
                    propertys[propertys.length] = _this.getContainer(snippet);
                }
                else if (qryprop == qrycons.snippets.ENTITY) {
                    propertys[propertys.length] = _this.getEntity(snippet);
                }
                else if (qryprop == qrycons.snippets.DOCUMENTATION) {
                    propertys[propertys.length] = _this.getDocumentation(snippet);
                }
                else {
                    propertys[propertys.length] = new MMDAO.OutputObjectProperty("Unknown Property", "Value of Unknown Property");
                }
            });
        }
        return propertys;
    };
    SnippetAdapter.prototype.getEntity = function (snippet) {
        var property;
        property = new MMDAO.OutputObjectProperty(qrycons.snippets.ENTITY, snippet.entityQualifiedName);
        return property;
    };
    return SnippetAdapter;
}(DocumentAdapter));
exports.SnippetAdapter = SnippetAdapter;
var ElementAdapter = /** @class */ (function (_super) {
    __extends(ElementAdapter, _super);
    function ElementAdapter() {
        return _super.call(this) || this;
    }
    return ElementAdapter;
}(AbstractElementAdapter));
exports.ElementAdapter = ElementAdapter;
var WidgetAdapter = /** @class */ (function (_super) {
    __extends(WidgetAdapter, _super);
    function WidgetAdapter() {
        return _super.call(this) || this;
    }
    WidgetAdapter.prototype.getWidgetPropertys = function (customwidget, qrypropertys) {
        var _this = this;
        var propertys = new Array();
        if (qrypropertys[0] == qrycons.widgetcalls.ALL) {
            propertys[propertys.length] = this.getName(customwidget);
            propertys[propertys.length] = this.getCallType(customwidget);
            propertys[propertys.length] = this.getCallCount(customwidget);
            propertys[propertys.length] = this.getCallLocations(customwidget);
        }
        else {
            qrypropertys.forEach(function (qryprop) {
                if (qryprop == qrycons.widgetcalls.NAME) {
                    propertys[propertys.length] = _this.getName(customwidget);
                }
                else if (qryprop == qrycons.widgetcalls.TYPE) {
                    propertys[propertys.length] = _this.getCallType(customwidget);
                }
                else if (qryprop == qrycons.widgetcalls.CALLCOUNT) {
                    propertys[propertys.length] = _this.getCallCount(customwidget);
                }
                else if (qryprop == qrycons.widgetcalls.CALLLOCATIONS) {
                    propertys[propertys.length] = _this.getCallLocations(customwidget);
                }
                else {
                    propertys[propertys.length] = new MMDAO.OutputObjectProperty("Unknown Property", "Value of Unknown Property");
                }
            });
        }
        return propertys;
    };
    WidgetAdapter.prototype.getName = function (cw) {
        var property;
        property = new MMDAO.OutputObjectProperty(qrycons.widgetcalls.NAME, cw.getPropertyValue(qrycons.widgetcalls.NAME));
        return property;
    };
    WidgetAdapter.prototype.getCallType = function (cw) {
        var property;
        property = new MMDAO.OutputObjectProperty(qrycons.widgetcalls.TYPE, cw.getPropertyValue(qrycons.widgetcalls.TYPE));
        return property;
    };
    WidgetAdapter.prototype.getCallCount = function (cw) {
        var property;
        property = new MMDAO.OutputObjectProperty(qrycons.widgetcalls.CALLCOUNT, cw.getCount().toString());
        return property;
    };
    WidgetAdapter.prototype.getCallLocations = function (cw) {
        var property;
        property = new MMDAO.OutputObjectProperty(qrycons.widgetcalls.CALLLOCATIONS, cw.getLocations());
        return property;
    };
    WidgetAdapter.prototype.getWidgetCounter = function (docs) {
        var _this = this;
        var list = new MMDAO.OutputObjectCounterList();
        var counter = new Array();
        var calls;
        docs.forEach(function (doc) {
            if (doc instanceof mendixmodelsdk_1.pages.Page || doc instanceof mendixmodelsdk_1.pages.Snippet || doc instanceof mendixmodelsdk_1.pages.Layout) {
                var returnedcounter = new Array();
                returnedcounter = _this.traverseForWidgets(doc);
                returnedcounter.forEach(function (count) {
                    counter[counter.length] = count;
                });
            }
        });
        calls = this.traverseForSnippetandLayoutCalls(docs);
        //Calls verarbeiten
        calls.forEach(function (call) {
            docs.forEach(function (doc) {
                if (doc.qualifiedName == call) {
                    var returnedcounter = new Array();
                    returnedcounter = _this.traverseForWidgets(doc);
                    returnedcounter.forEach(function (count) {
                        counter[counter.length] = count;
                    });
                }
            });
        });
        counter.forEach(function (count) {
            list.addAndCount(count);
        });
        return list;
    };
    WidgetAdapter.prototype.traverseForSnippetandLayoutCalls = function (docs) {
        var names = new Array();
        docs.forEach(function (doc) {
            doc.traverse(function (structure) {
                if (structure instanceof mendixmodelsdk_1.pages.SnippetCall) {
                    names[names.length] = structure.snippetQualifiedName;
                }
                if (structure instanceof mendixmodelsdk_1.pages.LayoutCall) {
                    names[names.length] = structure.layoutQualifiedName;
                }
            });
        });
        return names;
    };
    WidgetAdapter.prototype.traverseForWidgets = function (doc) {
        var counter = new Array();
        doc.traverse(function (structure) {
            if (structure instanceof mendixmodelsdk_1.pages.Widget && !(structure.structureTypeName === "CustomWidgets$CustomWidget")) {
                var widget_name;
                widget_name = structure.structureTypeName;
                counter[counter.length] = new MMDAO.OutputObjectCounter([new MMDAO.OutputObjectProperty("NAME", widget_name), new MMDAO.OutputObjectProperty("TYPE", "Pages$Widget")], doc.qualifiedName);
            }
        });
        return counter;
    };
    return WidgetAdapter;
}(ElementAdapter));
exports.WidgetAdapter = WidgetAdapter;
var CustomWidgetAdapter = /** @class */ (function (_super) {
    __extends(CustomWidgetAdapter, _super);
    function CustomWidgetAdapter() {
        return _super.call(this) || this;
    }
    CustomWidgetAdapter.prototype.getCustomWidgetPropertys = function (customwidget, qrypropertys) {
        var _this = this;
        var propertys = new Array();
        if (qrypropertys[0] == qrycons.customwidgetcalls.ALL) {
            propertys[propertys.length] = this.getName(customwidget);
            propertys[propertys.length] = this.getCallType(customwidget);
            propertys[propertys.length] = this.getCallCount(customwidget);
            propertys[propertys.length] = this.getCallLocations(customwidget);
        }
        else {
            qrypropertys.forEach(function (qryprop) {
                if (qryprop == qrycons.customwidgetcalls.NAME) {
                    propertys[propertys.length] = _this.getName(customwidget);
                }
                else if (qryprop == qrycons.customwidgetcalls.TYPE) {
                    propertys[propertys.length] = _this.getCallType(customwidget);
                }
                else if (qryprop == qrycons.customwidgetcalls.CALLCOUNT) {
                    propertys[propertys.length] = _this.getCallCount(customwidget);
                }
                else if (qryprop == qrycons.customwidgetcalls.CALLLOCATIONS) {
                    propertys[propertys.length] = _this.getCallLocations(customwidget);
                }
                else {
                    propertys[propertys.length] = new MMDAO.OutputObjectProperty("Unknown Property", "Value of Unknown Property");
                }
            });
        }
        return propertys;
    };
    CustomWidgetAdapter.prototype.getCustomWidgetCounter = function (docs) {
        var _this = this;
        var list = new MMDAO.OutputObjectCounterList();
        var counter = new Array();
        var calls;
        docs.forEach(function (doc) {
            if (doc instanceof mendixmodelsdk_1.pages.Page || doc instanceof mendixmodelsdk_1.pages.Snippet || doc instanceof mendixmodelsdk_1.pages.Layout) {
                var returnedcounter = new Array();
                returnedcounter = _this.traverseForCustomWidgets(doc);
                returnedcounter.forEach(function (count) {
                    counter[counter.length] = count;
                });
            }
        });
        calls = this.traverseForSnippetandLayoutCalls(docs);
        //Calls verarbeiten
        calls.forEach(function (call) {
            docs.forEach(function (doc) {
                if (doc.qualifiedName == call) {
                    var returnedcounter = new Array();
                    returnedcounter = _this.traverseForCustomWidgets(doc);
                    returnedcounter.forEach(function (count) {
                        counter[counter.length] = count;
                    });
                }
            });
        });
        counter.forEach(function (count) {
            list.addAndCount(count);
        });
        return list;
    };
    CustomWidgetAdapter.prototype.traverseForCustomWidgets = function (doc) {
        var counter = new Array();
        doc.traverse(function (structure) {
            if (structure instanceof mendixmodelsdk_1.pages.Widget && structure.structureTypeName === "CustomWidgets$CustomWidget") {
                var widget_name;
                structure.traverse(function (elem) {
                    if (elem instanceof mendixmodelsdk_1.customwidgets.CustomWidgetType) {
                        var cwtype;
                        cwtype = elem;
                        widget_name = cwtype.name;
                    }
                });
                counter[counter.length] = new MMDAO.OutputObjectCounter([new MMDAO.OutputObjectProperty("NAME", widget_name), new MMDAO.OutputObjectProperty("TYPE", structure.structureTypeName)], doc.qualifiedName);
            }
        });
        return counter;
    };
    return CustomWidgetAdapter;
}(WidgetAdapter));
exports.CustomWidgetAdapter = CustomWidgetAdapter;
