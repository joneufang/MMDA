import {ModelSdkClient, IModel, IModelUnit, domainmodels, utils, pages, customwidgets, projects, documenttemplates, AbstractElement, constants, enumerations, images} from "mendixmodelsdk";
import * as MMDAO from "./MMDAOutputObject";
import * as MMDA from "./MendixMetaDataAPI";
import * as qrycons from "./MMDAQueryConstants";
import { Structure } from "mendixmodelsdk/dist/sdk/internal/structures";

//Adapter to get propertys and filter Mendix Objects
export class StructureAdapter {

    constructor() {

    }

    //Get Id of Mendix Object
    protected getId(structure : Structure) : MMDAO.OutputObjectProperty {
        var property : MMDAO.OutputObjectProperty;

        property = new MMDAO.OutputObjectProperty(qrycons.documents.ID,structure.id);

        return property; 
    }

    //Get Type of Mendix Object
    protected getType(structure : Structure) : MMDAO.OutputObjectProperty {
        var property : MMDAO.OutputObjectProperty;

        property = new MMDAO.OutputObjectProperty(qrycons.documents.TYPE,structure.structureTypeName);

        return property; 
    }

    //Get Container of Mendix Object
    protected getContainer(structure : Structure) : MMDAO.OutputObjectProperty {
        var property : MMDAO.OutputObjectProperty;
        var container = "Kein Container"

        try{
            var fbase = structure.container;
            if(fbase instanceof projects.Folder)
            {
                var folder : projects.Folder = fbase;
                container = folder.name;
            }
            else if(fbase instanceof projects.Module)
            {
                var modul : projects.Module = fbase;
                container = modul.name;
            }
        }
        catch(error)
        {

        }
        property = new MMDAO.OutputObjectProperty(qrycons.documents.CONTAINER,container);

        return property; 
    }

    //Filters Output Object
    //Returns true if Object passes all filters
    public filter(MMDAobject : MMDAO.OutputObject, filter : MMDA.Filter[]) : boolean
    {
        var filtered : boolean = true;
        var filtercount : number = 0;

        filter.forEach((qryfilter) => {
            //onsole.log("FilterType: " + qryfilter.getType)
            var regex = qryfilter.getValue();
            var value = MMDAobject.getPropertyValue(qryfilter.getType()); 
            if(!(value.match(regex) || regex == value))
            {
                filtered = false;
            }
            filtercount++;
        })

        return filtered;
    }
}

export class AbstractElementAdapter extends StructureAdapter {
    constructor() {
        super();   
    }
}

export class AbstractUnitAdapter extends StructureAdapter {
    constructor() {
        super();   
    }
}

export class StructuralUnitAdapter extends AbstractUnitAdapter {
    constructor() {
        super();   
    }
}

export class FolderBaseAdapter extends StructuralUnitAdapter {
    constructor() {
        super();   
    }
}

export class ModuleDocumentAdapter extends AbstractElementAdapter {
    constructor() {
        super();   
    }
}

export class DomainModelAdapter extends ModuleDocumentAdapter {
    constructor() {
        super();   
    }

    public getDomainModelPropertys(domainmodel : domainmodels.DomainModel, qrypropertys : string[]) : MMDAO.OutputObjectProperty[] {
        var propertys : MMDAO.OutputObjectProperty[] = new Array();
        if(qrypropertys[0] == qrycons.domainmodels.ALL)
        {
            propertys[propertys.length] = this.getId(domainmodel);
            propertys[propertys.length] = this.getType(domainmodel);
            propertys[propertys.length] = this.getContainer(domainmodel);
            propertys[propertys.length] = this.getDocumentation(domainmodel);  
            propertys[propertys.length] = this.getEntities(domainmodel); 
            propertys[propertys.length] = this.getAssociations(domainmodel); 
        }
        else
        {
            qrypropertys.forEach((qryprop) => {
                if(qryprop == qrycons.domainmodels.ID)
                {
                    propertys[propertys.length] = this.getId(domainmodel);
                }
                else if(qryprop == qrycons.domainmodels.TYPE)
                {
                    propertys[propertys.length] = this.getType(domainmodel);
                }
                else if(qryprop == qrycons.domainmodels.CONTAINER)
                {
                    propertys[propertys.length] = this.getContainer(domainmodel);
                }
                else if(qryprop == qrycons.domainmodels.DOCUMENTATION)
                {
                    propertys[propertys.length] = this.getDocumentation(domainmodel);
                }
                else if(qryprop == qrycons.domainmodels.ENTITIES)
                {
                    propertys[propertys.length] = this.getEntities(domainmodel);
                }
                else if(qryprop == qrycons.domainmodels.ASSOCIATIONS)
                {
                    propertys[propertys.length] = this.getAssociations(domainmodel);
                }
                else
                {
                    propertys[propertys.length] = new MMDAO.OutputObjectProperty("Unknown Property","Value of Unknown Property");
                }
            })
        }
        return propertys;
    }

    protected getDocumentation(domainmodel : domainmodels.DomainModel) : MMDAO.OutputObjectProperty {
        var property : MMDAO.OutputObjectProperty;

        property = new MMDAO.OutputObjectProperty(qrycons.domainmodels.DOCUMENTATION,"No Value loaded");    //Muss noch richtig implementiert werden aktuell überall No Value muss mit .load(callback) geladen werden.
        
        if(domainmodel.isLoaded) {
            var docu = domainmodel.documentation;
            docu = docu.replace(/\r/g, "");
            docu = docu.replace(/\n/g, "\t");
            if(docu == "")
            {
                property = new MMDAO.OutputObjectProperty(qrycons.domainmodels.DOCUMENTATION,"No Documentation");
            }
            else
            {
                property = new MMDAO.OutputObjectProperty(qrycons.domainmodels.DOCUMENTATION,docu);
            }
        }
        
        return property;
    }

    protected getEntities(domainmodel : domainmodels.DomainModel) : MMDAO.OutputObjectProperty {
        var property : MMDAO.OutputObjectProperty;
        var result : string = "";

        domainmodel.entities.forEach((entity) => {
            result += entity.qualifiedName + ", ";
        });
        
        //console.log("Entities: " + result + "\n");

        property = new MMDAO.OutputObjectProperty(qrycons.domainmodels.ENTITIES,result);
        
        return property;
    }

    protected getAssociations(domainmodel : domainmodels.DomainModel) : MMDAO.OutputObjectProperty {
        var property : MMDAO.OutputObjectProperty;
        var result : string = "";

        domainmodel.associations.forEach((associ) => {
            result += associ.qualifiedName + ", ";
        });
        
        //console.log("Associations: " + result + "\n");

        property = new MMDAO.OutputObjectProperty(qrycons.domainmodels.ASSOCIATIONS,result);
        
        return property;
    }
}


//Adapter to get propertys of Mendix Documents
export class DocumentAdapter extends ModuleDocumentAdapter {
    
    constructor() {
        super();   
    }

    //Gets all wanted propertys from a Mendix Document
    //Returns Array of Output Object Properties
    public getDocumentPropertys(document : projects.Document, qrypropertys : string[]) : MMDAO.OutputObjectProperty[] {
        var propertys : MMDAO.OutputObjectProperty[] = new Array();
        if(qrypropertys[0] == qrycons.documents.ALL)
        {
            propertys[propertys.length] = this.getId(document);
            propertys[propertys.length] = this.getName(document);
            propertys[propertys.length] = this.getType(document);
            propertys[propertys.length] = this.getContainer(document);
            propertys[propertys.length] = this.getDocumentation(document);   
        }
        else
        {
            qrypropertys.forEach((qryprop) => {
                if(qryprop == qrycons.documents.ID)
                {
                    propertys[propertys.length] = this.getId(document);
                }
                else if(qryprop == qrycons.documents.NAME)
                {
                    propertys[propertys.length] = this.getName(document);
                }
                else if(qryprop == qrycons.documents.TYPE)
                {
                    propertys[propertys.length] = this.getType(document);
                }
                else if(qryprop == qrycons.documents.CONTAINER)
                {
                    propertys[propertys.length] = this.getContainer(document);
                }
                else if(qryprop == qrycons.documents.DOCUMENTATION)
                {
                    propertys[propertys.length] = this.getDocumentation(document);
                }
                else
                {
                    propertys[propertys.length] = new MMDAO.OutputObjectProperty("Unknown Property","Value of Unknown Property");
                }
            })
        }
        return propertys;
    }

    //gets Name of a Mendix Document
    protected getName(document : projects.Document) : MMDAO.OutputObjectProperty {
        var property : MMDAO.OutputObjectProperty;
        
        property = new MMDAO.OutputObjectProperty(qrycons.documents.NAME,document.qualifiedName);
        
        return property;
    }

    //gets Documentation of a Mendix Document
    protected getDocumentation(document : projects.Document) : MMDAO.OutputObjectProperty {
        var property : MMDAO.OutputObjectProperty;

        property = new MMDAO.OutputObjectProperty(qrycons.documents.DOCUMENTATION,"No Value loaded");    //Muss noch richtig implementiert werden aktuell überall No Value muss mit .load(callback) geladen werden.
        
        if(document.isLoaded) {
            var docu = document.documentation;
            docu = docu.replace(/\r/g, "");
            docu = docu.replace(/\n/g, "\t");
            if(docu == "")
            {
                property = new MMDAO.OutputObjectProperty(qrycons.documents.DOCUMENTATION,"No Documentation");
            }
            else
            {
                property = new MMDAO.OutputObjectProperty(qrycons.documents.DOCUMENTATION,docu);
            }
        }
        
        return property;
    }
}

export class FormBaseAdapter extends DocumentAdapter {
    constructor() {
        super();   
    }
}

export class ConstantAdapter extends DocumentAdapter {
    
    constructor() {
        super();   
    }

    public getConstantPropertys(constant : constants.Constant, qrypropertys : string[]) : MMDAO.OutputObjectProperty[] {
        var propertys : MMDAO.OutputObjectProperty[] = new Array();
        if(qrypropertys[0] == qrycons.constants.ALL)
        {
            propertys[propertys.length] = this.getId(constant);
            propertys[propertys.length] = this.getName(constant);
            propertys[propertys.length] = this.getType(constant);
            propertys[propertys.length] = this.getContainer(constant);
            propertys[propertys.length] = this.getDataType(constant);
            propertys[propertys.length] = this.getDataValue(constant);
            propertys[propertys.length] = this.getDocumentation(constant);   
        }
        else
        {
            qrypropertys.forEach((qryprop) => {
                if(qryprop == qrycons.constants.ID)
                {
                    propertys[propertys.length] = this.getId(constant);
                }
                else if(qryprop == qrycons.constants.NAME)
                {
                    propertys[propertys.length] = this.getName(constant);
                }
                else if(qryprop == qrycons.constants.TYPE)
                {
                    propertys[propertys.length] = this.getType(constant);
                }
                else if(qryprop == qrycons.constants.CONTAINER)
                {
                    propertys[propertys.length] = this.getContainer(constant);
                }
                else if(qryprop == qrycons.constants.DATATYPE)
                {
                    propertys[propertys.length] = this.getDataType(constant);
                }
                else if(qryprop == qrycons.constants.DATAVALUE)
                {
                    propertys[propertys.length] = this.getDataValue(constant);
                }
                else if(qryprop == qrycons.constants.DOCUMENTATION)
                {
                    propertys[propertys.length] = this.getDocumentation(constant);
                }
                else
                {
                    propertys[propertys.length] = new MMDAO.OutputObjectProperty("Unknown Property","Value of Unknown Property");
                }
            })
        }
        return propertys;
    }

    protected getDataType(constant : constants.Constant) : MMDAO.OutputObjectProperty {
        var property : MMDAO.OutputObjectProperty;
        
        property = new MMDAO.OutputObjectProperty(qrycons.constants.DATATYPE,constant.dataType);
        
        return property;
    }

    protected getDataValue(constant : constants.Constant) : MMDAO.OutputObjectProperty {
        var property : MMDAO.OutputObjectProperty;
        
        property = new MMDAO.OutputObjectProperty(qrycons.constants.DATAVALUE,constant.defaultValue);
        
        return property;
    }

}

export class EnumerationAdapter extends DocumentAdapter {
    
    constructor() {
        super();   
    }

    public getEnumerationPropertys(enumeration : enumerations.Enumeration, qrypropertys : string[]) : MMDAO.OutputObjectProperty[] {
        var propertys : MMDAO.OutputObjectProperty[] = new Array();
        if(qrypropertys[0] == qrycons.enumerations.ALL)
        {
            propertys[propertys.length] = this.getId(enumeration);
            propertys[propertys.length] = this.getName(enumeration);
            propertys[propertys.length] = this.getType(enumeration);
            propertys[propertys.length] = this.getValues(enumeration);
            propertys[propertys.length] = this.getContainer(enumeration);
            propertys[propertys.length] = this.getDocumentation(enumeration);   
        }
        else
        {
            qrypropertys.forEach((qryprop) => {
                if(qryprop == qrycons.enumerations.ID)
                {
                    propertys[propertys.length] = this.getId(enumeration);
                }
                else if(qryprop == qrycons.enumerations.NAME)
                {
                    propertys[propertys.length] = this.getName(enumeration);
                }
                else if(qryprop == qrycons.enumerations.TYPE)
                {
                    propertys[propertys.length] = this.getType(enumeration);
                }
                else if(qryprop == qrycons.enumerations.VALUES)
                {
                    propertys[propertys.length] = this.getValues(enumeration);
                }
                else if(qryprop == qrycons.enumerations.CONTAINER)
                {
                    propertys[propertys.length] = this.getContainer(enumeration);
                }
                else if(qryprop == qrycons.enumerations.DOCUMENTATION)
                {
                    propertys[propertys.length] = this.getDocumentation(enumeration);
                }
                else
                {
                    propertys[propertys.length] = new MMDAO.OutputObjectProperty("Unknown Property","Value of Unknown Property");
                }
            })
        }
        return propertys;
    }

    protected getValues(enumeration : enumerations.Enumeration) : MMDAO.OutputObjectProperty {
        var property : MMDAO.OutputObjectProperty;

        var result : string = "";
        
                enumeration.values.forEach((value) => {
                    result += value.name + ", ";
                });
        
        property = new MMDAO.OutputObjectProperty(qrycons.enumerations.VALUES,result);
       
        return property;
    }

}

export class ImageCollectionAdapter extends DocumentAdapter {
    
    constructor() {
        super();   
    }

    public getImageCollectionPropertys(imagecollection : images.ImageCollection, qrypropertys : string[]) : MMDAO.OutputObjectProperty[] {
        var propertys : MMDAO.OutputObjectProperty[] = new Array();
        if(qrypropertys[0] == qrycons.imagecollections.ALL)
        {
            propertys[propertys.length] = this.getId(imagecollection);
            propertys[propertys.length] = this.getName(imagecollection);
            propertys[propertys.length] = this.getType(imagecollection);
            propertys[propertys.length] = this.getImages(imagecollection);
            propertys[propertys.length] = this.getContainer(imagecollection);
            propertys[propertys.length] = this.getDocumentation(imagecollection);   
        }
        else
        {
            qrypropertys.forEach((qryprop) => {
                if(qryprop == qrycons.imagecollections.ID)
                {
                    propertys[propertys.length] = this.getId(imagecollection);
                }
                else if(qryprop == qrycons.imagecollections.NAME)
                {
                    propertys[propertys.length] = this.getName(imagecollection);
                }
                else if(qryprop == qrycons.imagecollections.TYPE)
                {
                    propertys[propertys.length] = this.getType(imagecollection);
                }
                else if(qryprop == qrycons.imagecollections.IMAGES)
                {
                    propertys[propertys.length] = this.getImages(imagecollection);
                }
                else if(qryprop == qrycons.imagecollections.IMAGES)
                {
                    propertys[propertys.length] = this.getContainer(imagecollection);
                }
                else if(qryprop == qrycons.imagecollections.DOCUMENTATION)
                {
                    propertys[propertys.length] = this.getDocumentation(imagecollection);
                }
                else
                {
                    propertys[propertys.length] = new MMDAO.OutputObjectProperty("Unknown Property","Value of Unknown Property");
                }
            })
        }
        return propertys;
    }

    protected getImages(imagecollection : images.ImageCollection) : MMDAO.OutputObjectProperty {
        var property : MMDAO.OutputObjectProperty;

        var result : string = "";
        
                imagecollection.images.forEach((img) => {
                    result += img.qualifiedName + ", ";
                });
        
        property = new MMDAO.OutputObjectProperty(qrycons.imagecollections.IMAGES,result);
       
        return property;
    }

}

export class FolderAdapter extends FolderBaseAdapter {
    
    constructor() {
        super();   
    }

    public getFolderPropertys(folder : projects.Folder, qrypropertys : string[]) : MMDAO.OutputObjectProperty[] {
        var propertys : MMDAO.OutputObjectProperty[] = new Array();
        if(qrypropertys[0] == qrycons.folders.ALL)
        {
            propertys[propertys.length] = this.getId(folder);
            propertys[propertys.length] = this.getName(folder);
            propertys[propertys.length] = this.getType(folder);
            propertys[propertys.length] = this.getContainer(folder);
            propertys[propertys.length] = this.getDocuments(folder); 
            propertys[propertys.length] = this.getSubFolders(folder);  
        }
        else
        {
            qrypropertys.forEach((qryprop) => {
                if(qryprop == qrycons.folders.ID)
                {
                    propertys[propertys.length] = this.getId(folder);
                }
                else if(qryprop == qrycons.folders.NAME)
                {
                    propertys[propertys.length] = this.getName(folder);
                }
                else if(qryprop == qrycons.folders.TYPE)
                {
                    propertys[propertys.length] = this.getType(folder);
                }
                else if(qryprop == qrycons.folders.CONTAINER)
                {
                    propertys[propertys.length] = this.getContainer(folder);
                }
                else if(qryprop == qrycons.folders.SUBFOLDERS)
                {
                    propertys[propertys.length] = this.getSubFolders(folder);
                }
                else if(qryprop == qrycons.folders.DOCUMENTS)
                {
                    propertys[propertys.length] = this.getDocuments(folder);
                }
                else
                {
                    propertys[propertys.length] = new MMDAO.OutputObjectProperty("Unknown Property","Value of Unknown Property");
                }
            })
        }
        return propertys;
    }

    protected getDocuments(folder : projects.Folder) : MMDAO.OutputObjectProperty {
        var property : MMDAO.OutputObjectProperty;

        var result : string = "";
        
                folder.documents.forEach((doc) => {
                    result += doc.qualifiedName + ", ";
                });
        
        property = new MMDAO.OutputObjectProperty(qrycons.folders.DOCUMENTS,result);
       
        return property;
    }

    protected getSubFolders(folder : projects.Folder) : MMDAO.OutputObjectProperty {
        var property : MMDAO.OutputObjectProperty;

        var result : string = "";
        
                folder.folders.forEach((fold) => {
                    result += fold.name + ", ";
                });
        
        property = new MMDAO.OutputObjectProperty(qrycons.folders.SUBFOLDERS,result);
       
        return property;
    }

    protected getName(folder : projects.Folder) : MMDAO.OutputObjectProperty {
        var property : MMDAO.OutputObjectProperty;
        
        property = new MMDAO.OutputObjectProperty(qrycons.documents.NAME,folder.name);
        
        return property;
    }
}

export class LayoutAdapter extends DocumentAdapter {
    
    constructor() {
        super();   
    }

    public getLayoutPropertys(layout : pages.Layout, qrypropertys : string[]) : MMDAO.OutputObjectProperty[] {
        var propertys : MMDAO.OutputObjectProperty[] = new Array();
        if(qrypropertys[0] == qrycons.layouts.ALL)
        {
            propertys[propertys.length] = this.getId(layout);
            propertys[propertys.length] = this.getName(layout);
            propertys[propertys.length] = this.getType(layout);
            propertys[propertys.length] = this.getContainer(layout);
            propertys[propertys.length] = this.getLayoutType(layout);
            propertys[propertys.length] = this.getDocumentation(layout);   
        }
        else
        {
            qrypropertys.forEach((qryprop) => {
                if(qryprop == qrycons.layouts.ID)
                {
                    propertys[propertys.length] = this.getId(layout);
                }
                else if(qryprop == qrycons.layouts.NAME)
                {
                    propertys[propertys.length] = this.getName(layout);
                }
                else if(qryprop == qrycons.layouts.TYPE)
                {
                    propertys[propertys.length] = this.getType(layout);
                }
                else if(qryprop == qrycons.layouts.CONTAINER)
                {
                    propertys[propertys.length] = this.getContainer(layout);
                }
                else if(qryprop == qrycons.layouts.LAYOUTTYPE)
                {
                    propertys[propertys.length] = this.getLayoutType(layout);
                }
                else if(qryprop == qrycons.layouts.DOCUMENTATION)
                {
                    propertys[propertys.length] = this.getDocumentation(layout);
                }
                else
                {
                    propertys[propertys.length] = new MMDAO.OutputObjectProperty("Unknown Property","Value of Unknown Property");
                }
            })
        }
        return propertys;
    }

    protected getLayoutType(layout : pages.Layout) : MMDAO.OutputObjectProperty {
        var property : MMDAO.OutputObjectProperty;
        
        property = new MMDAO.OutputObjectProperty(qrycons.layouts.LAYOUTTYPE,layout.layoutType.name);
        
        return property;
    }

}