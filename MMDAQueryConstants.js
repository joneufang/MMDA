"use strict";
//All Constants for Propertys and Filter
Object.defineProperty(exports, "__esModule", { value: true });
var documents;
(function (documents) {
    documents.ID = "ID";
    documents.NAME = "NAME";
    documents.TYPE = "TYPE";
    documents.CONTAINER = "CONTAINER";
    documents.DOCUMENTATION = "DOCUMENTATION";
    documents.ALL = "ALL";
})(documents = exports.documents || (exports.documents = {}));
var constants;
(function (constants) {
    constants.ID = "ID";
    constants.NAME = "NAME";
    constants.TYPE = "TYPE";
    constants.CONTAINER = "CONTAINER";
    constants.DATATYPE = "DATATYPE";
    constants.DATAVALUE = "DATAVALUE";
    constants.DOCUMENTATION = "DOCUMENTATION";
    constants.ALL = "ALL";
})(constants = exports.constants || (exports.constants = {}));
var domainmodels;
(function (domainmodels) {
    domainmodels.ID = "ID";
    domainmodels.TYPE = "TYPE";
    domainmodels.CONTAINER = "CONTAINER";
    domainmodels.DOCUMENTATION = "DOCUMENTATION";
    domainmodels.ENTITIES = "ENTITIES";
    domainmodels.ASSOCIATIONS = "ASSOCIATIONS";
    domainmodels.ALL = "ALL";
})(domainmodels = exports.domainmodels || (exports.domainmodels = {}));
var enumerations;
(function (enumerations) {
    enumerations.ID = "ID";
    enumerations.NAME = "NAME";
    enumerations.TYPE = "TYPE";
    enumerations.CONTAINER = "CONTAINER";
    enumerations.VALUES = "VALUES";
    enumerations.DOCUMENTATION = "DOCUMENTATION";
    enumerations.ALL = "ALL";
})(enumerations = exports.enumerations || (exports.enumerations = {}));
var imagecollections;
(function (imagecollections) {
    imagecollections.ID = "ID";
    imagecollections.NAME = "NAME";
    imagecollections.TYPE = "TYPE";
    imagecollections.CONTAINER = "CONTAINER";
    imagecollections.IMAGES = "IMAGES";
    imagecollections.DOCUMENTATION = "DOCUMENTATION";
    imagecollections.ALL = "ALL";
})(imagecollections = exports.imagecollections || (exports.imagecollections = {}));
var folders;
(function (folders) {
    folders.ID = "ID";
    folders.NAME = "NAME";
    folders.TYPE = "TYPE";
    folders.CONTAINER = "CONTAINER";
    folders.DOCUMENTS = "DOCUMENTS";
    folders.SUBFOLDERS = "SUBFOLDERS";
    folders.ALL = "ALL";
})(folders = exports.folders || (exports.folders = {}));
var modules;
(function (modules) {
    modules.ID = "ID";
    modules.NAME = "NAME";
    modules.TYPE = "TYPE";
    modules.DOCUMENTS = "DOCUMENTS";
    modules.FOLDERS = "FOLDERS";
    modules.ALL = "ALL";
})(modules = exports.modules || (exports.modules = {}));
var layouts;
(function (layouts) {
    layouts.ID = "ID";
    layouts.NAME = "NAME";
    layouts.TYPE = "TYPE";
    layouts.CONTAINER = "CONTAINER";
    layouts.DOCUMENTATION = "DOCUMENTATION";
    layouts.LAYOUTTYPE = "LAYOUTTYPE";
    layouts.ALL = "ALL";
})(layouts = exports.layouts || (exports.layouts = {}));
var microflows;
(function (microflows) {
    microflows.ID = "ID";
    microflows.NAME = "NAME";
    microflows.TYPE = "TYPE";
    microflows.CONTAINER = "CONTAINER";
    microflows.DOCUMENTATION = "DOCUMENTATION";
    microflows.RETURNTYPE = "RETURNTYPE";
    microflows.ALL = "ALL";
})(microflows = exports.microflows || (exports.microflows = {}));
var pages;
(function (pages) {
    pages.ID = "ID";
    pages.NAME = "NAME";
    pages.TYPE = "TYPE";
    pages.CONTAINER = "CONTAINER";
    pages.DOCUMENTATION = "DOCUMENTATION";
    pages.LAYOUT = "LAYOUT";
    pages.ALLOWEDROLES = "ALLOWEDROLES";
    pages.URL = "URL";
    pages.ALL = "ALL";
})(pages = exports.pages || (exports.pages = {}));
var regularexpressions;
(function (regularexpressions) {
    regularexpressions.ID = "ID";
    regularexpressions.NAME = "NAME";
    regularexpressions.TYPE = "TYPE";
    regularexpressions.CONTAINER = "CONTAINER";
    regularexpressions.DOCUMENTATION = "DOCUMENTATION";
    regularexpressions.REGEX = "REGEX";
    regularexpressions.ALL = "ALL";
})(regularexpressions = exports.regularexpressions || (exports.regularexpressions = {}));
var snippets;
(function (snippets) {
    snippets.ID = "ID";
    snippets.NAME = "NAME";
    snippets.TYPE = "TYPE";
    snippets.CONTAINER = "CONTAINER";
    snippets.DOCUMENTATION = "DOCUMENTATION";
    snippets.ENTITY = "ENTITY";
    snippets.ALL = "ALL";
})(snippets = exports.snippets || (exports.snippets = {}));
var customwidgetcalls;
(function (customwidgetcalls) {
    customwidgetcalls.NAME = "NAME";
    customwidgetcalls.TYPE = "TYPE";
    customwidgetcalls.CALLCOUNT = "CALLCOUNT";
    customwidgetcalls.CALLLOCATIONS = "CALLLOCATIONS";
    customwidgetcalls.ALL = "ALL";
})(customwidgetcalls = exports.customwidgetcalls || (exports.customwidgetcalls = {}));
var widgetcalls;
(function (widgetcalls) {
    widgetcalls.NAME = "NAME";
    widgetcalls.TYPE = "TYPE";
    widgetcalls.CALLCOUNT = "CALLCOUNT";
    widgetcalls.CALLLOCATIONS = "CALLLOCATIONS";
    widgetcalls.ALL = "ALL";
})(widgetcalls = exports.widgetcalls || (exports.widgetcalls = {}));
var microflowcalls;
(function (microflowcalls) {
    microflowcalls.ID = "ID";
    microflowcalls.NAME = "NAME";
    microflowcalls.TYPE = "TYPE";
    microflowcalls.CALLCOUNT = "CALLCOUNT";
    microflowcalls.CALLLOCATIONS = "CALLLOCATIONS";
    microflowcalls.ALL = "ALL";
})(microflowcalls = exports.microflowcalls || (exports.microflowcalls = {}));
