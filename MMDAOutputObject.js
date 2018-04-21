"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs-extra");
var XMLWriter = require("xml-writer");
//ClassContainer for a List of OutputObjects
var OutputObjectList = /** @class */ (function () {
    function OutputObjectList() {
        //Constants to define output target
        this.TEXTFILE = "TEXTFILE";
        this.HTMLTABLE = "HTMLTABLE";
        this.XML = "XML";
        this.JSON = "JSON";
        this.propertylength = 20; //Length of columns for TextFile Output
        this.objects = new Array();
    }
    //Add Object to Container
    OutputObjectList.prototype.addObject = function (object) {
        this.objects[this.objects.length] = object;
    };
    //Sorts all Objects in Container in column order given
    OutputObjectList.prototype.sort = function (sortcolumns) {
        //console.log("Sort got " + sortcolumns);
        var sortingscount = sortcolumns.length;
        for (var i = (sortingscount - 1); i >= 0; i--) {
            var column = sortcolumns[i].getType();
            ;
            var isascending = sortcolumns[i].isAscending();
            this.sortColumn(column, isascending);
        }
        //Sorting need to be implemented !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        return this;
    };
    OutputObjectList.prototype.sortColumn = function (column, isascending) {
        //console.log("Sort Columns got " + column);
        for (var i = 0; i < this.objects.length; i++) {
            //console.log(this.objects[i].getPropertyValue(column));
            for (var j = 1; j < this.objects.length; j++) {
                if (isascending) {
                    if (this.objects[j - 1].getPropertyValue(column) > this.objects[j].getPropertyValue(column)) {
                        //Tausch
                        var temp = this.objects[j];
                        this.objects[j] = this.objects[j - 1];
                        this.objects[j - 1] = temp;
                    }
                }
                else {
                    if (this.objects[j - 1].getPropertyValue(column) < this.objects[j].getPropertyValue(column)) {
                        //Tausch
                        var temp = this.objects[j];
                        this.objects[j] = this.objects[j - 1];
                        this.objects[j - 1] = temp;
                    }
                }
            }
        }
    };
    //Serialize Container Objects for a TextFile
    OutputObjectList.prototype.toTextFileString = function () {
        var _this = this;
        if (this.objects.length > 0) {
            var result_1 = "";
            this.objects.forEach(function (obj) {
                if (obj.getLongestPropertySize() > _this.propertylength - 3) {
                    _this.propertylength = obj.getLongestPropertySize() + 3;
                }
            });
            result_1 += this.objects[0].getHeaderNormalized(this.propertylength) + "\n\n";
            this.objects.forEach(function (obj) {
                result_1 += obj.toStringNormalized(_this.propertylength) + "\n";
            });
            return result_1;
        }
        else {
            return "No Entrys Found";
        }
    };
    //Serialize Container Objects for a XMLFile
    OutputObjectList.prototype.toXMLFileString = function () {
        var xml = new XMLWriter();
        if (this.objects.length > 0) {
            xml.startDocument();
            xml.startElement("MMDACatalog");
            this.objects.forEach(function (obj) {
                xml.startElement(obj.getType());
                xml = obj.toXMLString(xml);
                xml.endElement();
            });
            xml.endElement();
            xml.endDocument();
            return xml.toString();
        }
        else {
            return "No Entrys Found";
        }
    };
    OutputObjectList.prototype.toHTMLFileString = function () {
        var result = "";
        if (this.objects.length > 0) {
            result += "<table style=\"width:100%\">\n";
            result += "<tr>\n";
            result += this.objects[0].toHTMLHeader();
            result += "</tr>\n";
            this.objects.forEach(function (obj) {
                result += "<tr>\n";
                result += obj.toHTMLString();
                result += "</tr>\n";
            });
            result += "</table>";
            return result;
        }
        else {
            return "No Entrys Found";
        }
    };
    OutputObjectList.prototype.toJSONFileString = function () {
        var result = "";
        var objectcounter = 0;
        if (this.objects.length > 0) {
            result += "{\n";
            result += "\"MMDACatalog\": {\n";
            for (var i = 0; i < this.objects.length; i++) {
                result += "\"" + this.objects[i].getType() + objectcounter + "\": {";
                objectcounter += 1;
                result += this.objects[i].toJSONString();
                if (i < this.objects.length - 1) {
                    result += "},\n";
                }
                else {
                    result += "}\n";
                }
            }
            result += "}\n";
            result += "}\n";
            return result;
        }
        else {
            return "No Entrys Found";
        }
    };
    //Gives out OutputObjectList
    OutputObjectList.prototype.returnResult = function (resultType, target) {
        if (resultType == this.TEXTFILE) {
            fs.outputFile(target, this.toTextFileString());
        } //Add ResultTypes Here
        else if (resultType == this.XML) {
            fs.outputFile(target, this.toXMLFileString());
        }
        else if (resultType == this.HTMLTABLE) {
            fs.outputFile(target, this.toHTMLFileString());
        }
        else if (resultType == this.JSON) {
            //fs.outputFile(target, "ReturnFormat JSON not implemented yet");
            fs.outputFile(target, this.toJSONFileString());
        }
        else {
            console.log("Wrong ResultType");
        }
    };
    return OutputObjectList;
}());
exports.OutputObjectList = OutputObjectList;
//Container for a single MendixObject
var OutputObject = /** @class */ (function () {
    function OutputObject(propertys, type) {
        this.propertys = propertys;
        this.type = type;
    }
    //Add Property to Object
    OutputObject.prototype.addProperty = function (name, value) {
        var prop = new OutputObjectProperty(name, value);
        this.propertys[this.propertys.length] = prop;
    };
    //Get Value of given property
    OutputObject.prototype.getPropertyValue = function (name) {
        var value = "Property not found";
        this.propertys.forEach(function (prop) {
            if (prop.getName() == name) {
                if (prop.toString() == null) {
                    value = "";
                }
                else {
                    value = prop.toString();
                }
            }
        });
        return value;
    };
    OutputObject.prototype.getType = function () {
        return this.type;
    };
    //Serialize ObjectData
    OutputObject.prototype.toString = function () {
        var result = "";
        this.propertys.forEach(function (prop) {
            result += prop.toString() + "\t";
        });
        return result;
    };
    //Serialzie ObjectData to XML
    OutputObject.prototype.toXMLString = function (xml) {
        this.propertys.forEach(function (prop) {
            xml.startElement(prop.getName());
            if (prop.toString() == null) {
                xml.text("");
            }
            else {
                xml.text(prop.toString());
            }
            xml.endElement();
        });
        return xml;
    };
    OutputObject.prototype.toHTMLString = function () {
        var result = "";
        this.propertys.forEach(function (prop) {
            result += "<td>" + prop.toString() + "</td>";
        });
        result += "\n";
        return result;
    };
    OutputObject.prototype.toHTMLHeader = function () {
        var result = "";
        this.propertys.forEach(function (prop) {
            result += "<th>" + prop.getName() + "</th>";
        });
        result += "\n";
        return result;
    };
    OutputObject.prototype.toJSONString = function () {
        var result = "";
        for (var i = 0; i < this.propertys.length; i++) {
            if (i < this.propertys.length - 1) {
                result += "\"" + this.propertys[i].getName() + "\": \"" + this.propertys[i].toString() + "\",";
            }
            else {
                result += "\"" + this.propertys[i].getName() + "\": \"" + this.propertys[i].toString() + "\"";
            }
        }
        return result;
    };
    //Serialize ObjectData with Column length size for TextFile Output
    OutputObject.prototype.toStringNormalized = function (size) {
        var result = "";
        this.propertys.forEach(function (prop) {
            var delta = size - prop.toString().length;
            var str = prop.toString();
            for (var i = 0; i < delta; i++) {
                str += ' ';
            }
            result += str;
        });
        return result;
    };
    //Serialize Object Property Names
    OutputObject.prototype.getHeader = function () {
        var result = "";
        this.propertys.forEach(function (prop) {
            result += prop.getName() + "\t";
        });
        return result;
    };
    //Serialize Object Property Names with Column length size for TextFile Output
    OutputObject.prototype.getHeaderNormalized = function (size) {
        var result = "";
        this.propertys.forEach(function (prop) {
            var delta = size - prop.getName().length;
            var str = prop.getName();
            for (var i = 0; i < delta; i++) {
                str += ' ';
            }
            result += str;
        });
        return result;
    };
    //gets Length of the longest property in the Object
    OutputObject.prototype.getLongestPropertySize = function () {
        var size = 0;
        this.propertys.forEach(function (prop) {
            if (prop.toString().length > size) {
                size = prop.toString().length;
            }
        });
        return size;
    };
    return OutputObject;
}());
exports.OutputObject = OutputObject;
var OutputObjectCounter = /** @class */ (function () {
    function OutputObjectCounter(propertys, location) {
        this.propertys = propertys;
        this.locations = location;
        this.count = 1;
    }
    //Add Property to Object
    OutputObjectCounter.prototype.addProperty = function (name, value) {
        var prop = new OutputObjectProperty(name, value);
        this.propertys[this.propertys.length] = prop;
    };
    //Get Value of given property
    OutputObjectCounter.prototype.getPropertyValue = function (name) {
        var value = "Property not found";
        this.propertys.forEach(function (prop) {
            if (prop.getName() == name) {
                if (prop.toString() == null) {
                    value = "";
                }
                else {
                    value = prop.toString();
                }
            }
        });
        return value;
    };
    OutputObjectCounter.prototype.countAndLocation = function (location) {
        this.count++;
        if (!this.locations.match(location)) {
            this.locations = this.locations + ", " + location;
        }
    };
    OutputObjectCounter.prototype.getLocations = function () {
        return this.locations;
    };
    OutputObjectCounter.prototype.getCount = function () {
        return this.count;
    };
    OutputObjectCounter.prototype.resetCount = function () {
        this.count = 0;
    };
    //Serialize ObjectData
    OutputObjectCounter.prototype.toString = function () {
        var result = "";
        this.propertys.forEach(function (prop) {
            result += prop.toString() + "\t";
        });
        result += this.count + "\t";
        result += this.locations + "\t";
        return result;
    };
    //Serialize Object Property Names
    OutputObjectCounter.prototype.getHeader = function () {
        var result = "";
        this.propertys.forEach(function (prop) {
            result += prop.getName() + "\t";
        });
        result += "CallCounts" + "\t";
        result += "CallLocations" + "\t";
        return result;
    };
    return OutputObjectCounter;
}());
exports.OutputObjectCounter = OutputObjectCounter;
var OutputObjectCounterList = /** @class */ (function () {
    function OutputObjectCounterList() {
        this.objects = new Array();
    }
    OutputObjectCounterList.prototype.add = function (counter) {
        if (this.isElement(counter) == -1) {
            this.objects[this.objects.length] = counter;
        }
    };
    OutputObjectCounterList.prototype.addAndCount = function (counter) {
        var index;
        index = this.isElement(counter);
        if (index == -1) {
            this.objects[this.objects.length] = counter;
        }
        else {
            this.objects[index].countAndLocation(counter.getLocations());
        }
    };
    //returns Index of Element, -1 if not element
    OutputObjectCounterList.prototype.isElement = function (counter) {
        var i;
        var name;
        var gefunden = false;
        name = counter.getPropertyValue("NAME");
        for (i = 0; i < this.objects.length; i++) {
            if (this.objects[i].getPropertyValue("NAME") == name) {
                gefunden = true;
                return i;
            }
        }
        if (!gefunden) {
            return -1;
        }
    };
    OutputObjectCounterList.prototype.getCounter = function () {
        return this.objects;
    };
    OutputObjectCounterList.prototype.toString = function () {
        if (this.objects.length > 0) {
            var result_2 = "";
            result_2 += this.objects[0].getHeader() + "\n\n";
            this.objects.forEach(function (obj) {
                result_2 += obj.toString() + "\n";
            });
            return result_2;
        }
        else {
            return "No Entrys Found";
        }
    };
    return OutputObjectCounterList;
}());
exports.OutputObjectCounterList = OutputObjectCounterList;
//Container for a single MendixProperty
var OutputObjectProperty = /** @class */ (function () {
    function OutputObjectProperty(name, value) {
        this.name = name;
        this.value = value;
    }
    //getName of Property
    OutputObjectProperty.prototype.getName = function () {
        return this.name;
    };
    //getValue of Property
    OutputObjectProperty.prototype.toString = function () {
        return this.value;
    };
    return OutputObjectProperty;
}());
exports.OutputObjectProperty = OutputObjectProperty;
