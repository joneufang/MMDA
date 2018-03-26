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
        property = new MMDAO.OutputObjectProperty("ID", structure.id);
        return property;
    };
    //Get Type of Mendix Object
    StructureAdapter.prototype.getType = function (structure) {
        var property;
        property = new MMDAO.OutputObjectProperty("TYPE", structure.structureTypeName);
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
        property = new MMDAO.OutputObjectProperty("CONTAINER", container);
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
var ModuleDocumentAdapter = /** @class */ (function (_super) {
    __extends(ModuleDocumentAdapter, _super);
    function ModuleDocumentAdapter() {
        return _super.call(this) || this;
    }
    return ModuleDocumentAdapter;
}(AbstractElementAdapter));
exports.ModuleDocumentAdapter = ModuleDocumentAdapter;
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
        property = new MMDAO.OutputObjectProperty("NAME", document.qualifiedName);
        return property;
    };
    //gets Documentation of a Mendix Document
    DocumentAdapter.prototype.getDocumentation = function (document) {
        var property;
        property = new MMDAO.OutputObjectProperty("DOCUMENTATION", "No Value loaded"); //Muss noch richtig implementiert werden aktuell überall No Value muss mit .load(callback) geladen werden.
        if (document.isLoaded) {
            var docu = document.documentation;
            docu = docu.replace(/\r/g, "");
            docu = docu.replace(/\n/g, "\t");
            if (docu == "") {
                property = new MMDAO.OutputObjectProperty("DOCUMENTATION", "No Documentation");
            }
            else {
                property = new MMDAO.OutputObjectProperty("DOCUMENTATION", docu);
            }
        }
        return property;
    };
    return DocumentAdapter;
}(ModuleDocumentAdapter));
exports.DocumentAdapter = DocumentAdapter;
