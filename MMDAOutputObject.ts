import fs = require("fs-extra");
import XMLWriter = require('xml-writer');
import * as MMDA from "./MendixMetaDataAPI";


//ClassContainer for a List of OutputObjects
export class OutputObjectList
{
     //Constants to define output target
    protected readonly TEXTFILE = "TEXTFILE";            
    protected readonly HTMLTABLE = "HTMLTABLE";
    protected readonly XML = "XML";
    protected readonly JSON = "JSON";

    private objects : OutputObject[];      //Array of Objects
    private propertylength : number = 20;       //Length of columns for TextFile Output

    constructor() {
        this.objects = new Array();
    }

    //Add Object to Container
    public addObject(object : OutputObject) {
        this.objects[this.objects.length] = object;
    }

    //Sorts all Objects in Container in column order given
    public sort(sortcolumns : MMDA.Sorter[]) : OutputObjectList
    {
        //console.log("Sort got " + sortcolumns);
        var sortingscount = sortcolumns.length;
        for(var i = (sortingscount - 1); i >= 0; i--)
        {
            var column = sortcolumns[i].getType();;
            var isascending = sortcolumns[i].isAscending();
            this.sortColumn(column, isascending);
        }
        //Sorting need to be implemented !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        return this;
    }

    protected sortColumn(column : string, isascending : boolean)
    {
        //console.log("Sort Columns got " + column);
        for (var i=0; i <this.objects.length; i++)
        {
             //console.log(this.objects[i].getPropertyValue(column));
             for(var j=1; j < this.objects.length; j++)
             {
                 if(isascending) {
                    if(this.objects[j-1].getPropertyValue(column) > this.objects[j].getPropertyValue(column))
                    {
                        //Tausch
                        var temp = this.objects[j];
                        this.objects[j] = this.objects[j-1];
                        this.objects[j-1] = temp;
                    }
                 }
                 else {
                    if(this.objects[j-1].getPropertyValue(column) < this.objects[j].getPropertyValue(column))
                    {
                        //Tausch
                        var temp = this.objects[j];
                        this.objects[j] = this.objects[j-1];
                        this.objects[j-1] = temp;
                    }
                 }
                 
             }
        }
    }

    //Serialize Container Objects for a TextFile
    protected toTextFileString() {
        if(this.objects.length > 0) {
            let result : string = "";
            this.objects.forEach((obj) => {
                if(obj.getLongestPropertySize() > this.propertylength - 3)
                {
                    this.propertylength = obj.getLongestPropertySize() + 3;
                }
            });
            result += this.objects[0].getHeaderNormalized(this.propertylength) + "\n\n"; 
            this.objects.forEach((obj) => {
                result += obj.toStringNormalized(this.propertylength) + "\n";
            });
            return result;
        }
        else
        {
            return "No Entrys Found";
        }
        
    }

    //Serialize Container Objects for a XMLFile
    protected toXMLFileString() {
        var xml = new XMLWriter();
        if(this.objects.length > 0) {
            xml.startDocument();
            xml.startElement("MMDACatalog");
            this.objects.forEach((obj) => {
                xml.startElement(obj.getType());
                xml = obj.toXMLString(xml);
                xml.endElement();
            });
            xml.endElement();
            xml.endDocument();
            return xml.toString();
        }
        else
        {
            return "No Entrys Found";
        }
    }

    protected toHTMLFileString() {
        var result : string = "";
        if(this.objects.length > 0) {
            result += "<table style=\"width:100%\">\n";
            result += "<tr>\n";
            result += this.objects[0].toHTMLHeader();
            result += "</tr>\n";
            this.objects.forEach((obj) => {
                result += "<tr>\n";
                result += obj.toHTMLString();
                result += "</tr>\n";
            });
            result += "</table>";
            return result;
        }
        else
        {
            return "No Entrys Found";
        }
    }

    protected toJSONFileString() {
        var result : string = "";
        var objectcounter : number = 0;
        if(this.objects.length > 0) {
            result += "{\n";
            result += "\"MMDACatalog\": {\n";
            for(var i=0; i < this.objects.length; i++) {
                result += "\"" + this.objects[i].getType() + objectcounter + "\": {";
                objectcounter += 1;
                result += this.objects[i].toJSONString();
                if(i < this.objects.length - 1)
                {
                    result += "},\n";
                }
                else
                {
                    result += "}\n";
                }
            }
            result += "}\n";
            result += "}\n";
            return result;
        }
        else
        {
            return "No Entrys Found";
        }
    }

    //Gives out OutputObjectList
    public returnResult(resultType : string, target : string) {
        if(resultType == this.TEXTFILE)
        {
            fs.outputFile(target, this.toTextFileString());
        }                                                       //Add ResultTypes Here
        else if(resultType == this.XML) {
            fs.outputFile(target, this.toXMLFileString());
        }
        else if(resultType == this.HTMLTABLE) {
            fs.outputFile(target, this.toHTMLFileString());
        }
        else if(resultType == this.JSON) {
            //fs.outputFile(target, "ReturnFormat JSON not implemented yet");
            fs.outputFile(target, this.toJSONFileString());
        }
        else
        {
            console.log("Wrong ResultType");
        }
    }

    
}

//Container for a single MendixObject
export class OutputObject {
    private propertys : OutputObjectProperty[];   //Array of Propertys
    private type : String;

    constructor(propertys : OutputObjectProperty[], type : String) {
        this.propertys = propertys;
        this.type = type;
    }

    //Add Property to Object
    public addProperty(name : string, value : string) {
        let prop = new OutputObjectProperty(name, value);
        this.propertys[this.propertys.length] = prop
    }

    //Get Value of given property
    public getPropertyValue(name : string)
    {
        var value : string = "Property not found";
        this.propertys.forEach((prop) => {
            if(prop.getName() == name)
            {
                if(prop.toString() == null)
                {
                    value = "";
                }
                else
                {
                    value = prop.toString();
                }
               
            }
        });
        return value; 
    }

    public getType()
    {
        return this.type;
    }

    //Serialize ObjectData
    public toString() {
        let result : string = "";
        this.propertys.forEach((prop) => {
            result += prop.toString() + "\t";
        });
        return result;
    }

    //Serialzie ObjectData to XML
    public toXMLString(xml : XMLWriter) {
        this.propertys.forEach((prop) => {
            xml.startElement(prop.getName());
            if(prop.toString() == null)
            {
                xml.text("");
            }
            else
            {
                xml.text(prop.toString());
            }
            
            xml.endElement();
        });
        return xml;
    }

    public toHTMLString() {
        let result : string = "";
        this.propertys.forEach((prop) => {
            result += "<td>" + prop.toString() + "</td>";
        });
        result += "\n";
        return result;
    }

    public toHTMLHeader() {
        let result : string = "";
        this.propertys.forEach((prop) => {
            result += "<th>" + prop.getName() + "</th>";
        });
        result += "\n";
        return result;
    }

    public toJSONString() {
        let result : string = "";
        for(var i = 0; i < this.propertys.length; i++){
            if(i < this.propertys.length - 1)
            {
                result += "\"" + this.propertys[i].getName() + "\": \"" + this.propertys[i].toString() + "\",";
            }
            else
            {
                result += "\"" + this.propertys[i].getName() + "\": \"" + this.propertys[i].toString() + "\"";
            }
        }
        return result;
    }

    //Serialize ObjectData with Column length size for TextFile Output
    public toStringNormalized(size : number) {
        let result : string = "";
        this.propertys.forEach((prop) => {
            var delta = size - prop.toString().length; 
            var str = prop.toString();
            for(var i = 0; i<delta; i++)
            {
                str += ' ';
            }
            result += str;
        });
        return result;
    }

    //Serialize Object Property Names
    public getHeader() {
        let result : string = "";
        this.propertys.forEach((prop) => {
            result += prop.getName() + "\t";
        });
        return result;
    }

    //Serialize Object Property Names with Column length size for TextFile Output
    public getHeaderNormalized(size : number) {
        let result : string = "";
        this.propertys.forEach((prop) => {
            var delta = size - prop.getName().length; 
            var str = prop.getName();
            for(var i = 0; i<delta; i++)
            {
                str += ' ';
            }
            result += str;
        });
        return result;
    }

    //gets Length of the longest property in the Object
    public getLongestPropertySize() {
        var size : number = 0;
        this.propertys.forEach((prop) => {
            if(prop.toString().length > size)
            {
                size = prop.toString().length;
            }
        });
        return size;
    }
}

export class OutputObjectCounter {
    private propertys : OutputObjectProperty[];   //Array of Propertys
    private locations : string;
    private count : number;

    constructor(propertys : OutputObjectProperty[],location : string) {
        this.propertys = propertys;
        this.locations = location;
        this.count = 1;
    }

    //Add Property to Object
    public addProperty(name : string, value : string) {
        let prop = new OutputObjectProperty(name, value);
        this.propertys[this.propertys.length] = prop
    }

    //Get Value of given property
    public getPropertyValue(name : string)
    {
        var value : string = "Property not found";
        this.propertys.forEach((prop) => {
            if(prop.getName() == name)
            {
                if(prop.toString() == null)
                {
                    value = "";
                }
                else
                {
                    value = prop.toString();
                }
               
            }
        });
        return value; 
    }

    public countAndLocation(location : string) {
        this.count++;
        if(!this.locations.match(location))
        {
            this.locations = this.locations + ", " + location;
        }
    }

    public getLocations() {
        return this.locations;
    }

    public getCount() {
        return this.count;
    }

    public resetCount() {
        this.count = 0;
    }

    //Serialize ObjectData
    public toString() {
        let result : string = "";
        this.propertys.forEach((prop) => {
            result += prop.toString() + "\t";
        });
        result += this.count + "\t";
        result += this.locations + "\t";
        return result;
    }

    
    //Serialize Object Property Names
    public getHeader() {
        let result : string = "";
        this.propertys.forEach((prop) => {
            result += prop.getName() + "\t";
        });
        result += "CallCounts" + "\t";
        result += "CallLocations" + "\t";
        return result;
    }

    

}

export class OutputObjectCounterList {
    private objects : OutputObjectCounter[];

    constructor() {
        this.objects = new Array();
    }

    public add(counter : OutputObjectCounter) {
        if(this.isElement(counter)==-1){
            this.objects[this.objects.length] = counter;
        }
    }

    public addAndCount(counter : OutputObjectCounter) {
        var index : number;
        index = this.isElement(counter);
        if(index==-1){
            this.objects[this.objects.length] = counter;
        }
        else
        {
            this.objects[index].countAndLocation(counter.getLocations());
        }
    }

    
    //returns Index of Element, -1 if not element
    public isElement(counter : OutputObjectCounter) : number {
        var i;
        var name : string;
        var gefunden : boolean = false;
        name = counter.getPropertyValue("NAME");
        for(i=0; i < this.objects.length; i++) {
            if(this.objects[i].getPropertyValue("NAME")==name)
            {
                gefunden = true;
                return i;
            }
        }
        if(!gefunden)
        {
            return -1;
        }
    }

    public getCounter() {
        return this.objects;
    }

    public toString() {
        if(this.objects.length > 0) {
            let result : string = "";
            result += this.objects[0].getHeader() + "\n\n"; 
            this.objects.forEach((obj) => {
                result += obj.toString() + "\n";
            });
            return result;
        }
        else
        {
            return "No Entrys Found";
        }
        
    }
}

//Container for a single MendixProperty
export class OutputObjectProperty {
    private name : string;      //Name of the Property
    private value : string;     //Value of the Property

    constructor(name : string, value : string) {
        this.name = name;
        this.value = value;
    }

    //getName of Property
    public getName() {
        return this.name;
    }

    //getValue of Property
    public toString() {
        return this.value;
    }
}