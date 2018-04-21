import {ModelSdkClient, IModel, IModelUnit, domainmodels, utils, pages, customwidgets, projects, documenttemplates, AbstractElement, constants, enumerations, images, microflows, regularexpressions} from "mendixmodelsdk";
import {loadAsPromise} from "mendixplatformsdk";
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

export class MicroflowBaseAdapter extends DocumentAdapter {
    constructor() {
        super();   
    }
}

export class ServersideMicroflowAdapter extends MicroflowBaseAdapter {
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
                else if(qryprop == qrycons.imagecollections.CONTAINER)
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

export class MicroflowAdapter extends ServersideMicroflowAdapter {
    
    constructor() {
        super();   
    }

    public getMicroflowPropertys(microflow : microflows.Microflow, qrypropertys : string[]) : MMDAO.OutputObjectProperty[] {
        var propertys : MMDAO.OutputObjectProperty[] = new Array();
        if(qrypropertys[0] == qrycons.microflows.ALL)
        {
            propertys[propertys.length] = this.getId(microflow);
            propertys[propertys.length] = this.getName(microflow);
            propertys[propertys.length] = this.getType(microflow);
            propertys[propertys.length] = this.getContainer(microflow);
            propertys[propertys.length] = this.getReturnType(microflow);
            propertys[propertys.length] = this.getDocumentation(microflow);   
        }
        else
        {
            qrypropertys.forEach((qryprop) => {
                if(qryprop == qrycons.microflows.ID)
                {
                    propertys[propertys.length] = this.getId(microflow);
                }
                else if(qryprop == qrycons.microflows.NAME)
                {
                    propertys[propertys.length] = this.getName(microflow);
                }
                else if(qryprop == qrycons.microflows.TYPE)
                {
                    propertys[propertys.length] = this.getType(microflow);
                }
                else if(qryprop == qrycons.microflows.CONTAINER)
                {
                    propertys[propertys.length] = this.getContainer(microflow);
                }
                else if(qryprop == qrycons.microflows.RETURNTYPE)
                {
                    propertys[propertys.length] = this.getReturnType(microflow);
                }
                else if(qryprop == qrycons.microflows.DOCUMENTATION)
                {
                    propertys[propertys.length] = this.getDocumentation(microflow);
                }
                else
                {
                    propertys[propertys.length] = new MMDAO.OutputObjectProperty("Unknown Property","Value of Unknown Property");
                }
            })
        }
        return propertys;
    }

    protected getReturnType(microflow : microflows.Microflow) : MMDAO.OutputObjectProperty {
        var property : MMDAO.OutputObjectProperty;
        
        property = new MMDAO.OutputObjectProperty(qrycons.microflows.RETURNTYPE,microflow.returnType);
        
        return property;
    }

}

export class ModuleAdapter extends FolderBaseAdapter {
    
    constructor() {
        super();   
    }

    public getModulePropertys(modul : projects.Module, qrypropertys : string[]) : MMDAO.OutputObjectProperty[] {
        var propertys : MMDAO.OutputObjectProperty[] = new Array();
        if(qrypropertys[0] == qrycons.modules.ALL)
        {
            propertys[propertys.length] = this.getId(modul);
            propertys[propertys.length] = this.getName(modul);
            propertys[propertys.length] = this.getType(modul);
            propertys[propertys.length] = this.getContainer(modul);
            propertys[propertys.length] = this.getDocuments(modul); 
            propertys[propertys.length] = this.getFolders(modul);  
        }
        else
        {
            qrypropertys.forEach((qryprop) => {
                if(qryprop == qrycons.modules.ID)
                {
                    propertys[propertys.length] = this.getId(modul);
                }
                else if(qryprop == qrycons.modules.NAME)
                {
                    propertys[propertys.length] = this.getName(modul);
                }
                else if(qryprop == qrycons.modules.TYPE)
                {
                    propertys[propertys.length] = this.getType(modul);
                }
                else if(qryprop == qrycons.modules.FOLDERS)
                {
                    propertys[propertys.length] = this.getFolders(modul);
                }
                else if(qryprop == qrycons.modules.DOCUMENTS)
                {
                    propertys[propertys.length] = this.getDocuments(modul);
                }
                else
                {
                    propertys[propertys.length] = new MMDAO.OutputObjectProperty("Unknown Property","Value of Unknown Property");
                }
            })
        }
        return propertys;
    }

    protected getDocuments(modul : projects.Module) : MMDAO.OutputObjectProperty {
        var property : MMDAO.OutputObjectProperty;

        var result : string = "";
        
        modul.documents.forEach((doc) => {
            result += doc.qualifiedName + ", ";
        });
        
        property = new MMDAO.OutputObjectProperty(qrycons.modules.DOCUMENTS, result);
       
        return property;
    }

    protected getFolders(modul : projects.Module) : MMDAO.OutputObjectProperty {
        var property : MMDAO.OutputObjectProperty;

        var result : string = "";
        
        modul.folders.forEach((fold) => {
            result += fold.name + ", ";
        });
        
        property = new MMDAO.OutputObjectProperty(qrycons.modules.FOLDERS, result);
       
        return property;
    }

    protected getName(modul : projects.Module) : MMDAO.OutputObjectProperty {
        var property : MMDAO.OutputObjectProperty;
        
        property = new MMDAO.OutputObjectProperty(qrycons.modules.NAME, modul.name);
        
        return property;
    }
}

export class PageAdapter extends DocumentAdapter {
    
    constructor() {
        super();   
    }

    public getPagePropertys(page : pages.Page, qrypropertys : string[]) : MMDAO.OutputObjectProperty[] {
        var propertys : MMDAO.OutputObjectProperty[] = new Array();
        if(qrypropertys[0] == qrycons.pages.ALL)
        {
            propertys[propertys.length] = this.getId(page);
            propertys[propertys.length] = this.getName(page);
            propertys[propertys.length] = this.getType(page);
            propertys[propertys.length] = this.getContainer(page);
            propertys[propertys.length] = this.getLayout(page);
            propertys[propertys.length] = this.getAllowedRoles(page);
            propertys[propertys.length] = this.getURL(page);
            propertys[propertys.length] = this.getDocumentation(page);   
        }
        else
        {
            qrypropertys.forEach((qryprop) => {
                if(qryprop == qrycons.pages.ID)
                {
                    propertys[propertys.length] = this.getId(page);
                }
                else if(qryprop == qrycons.pages.NAME)
                {
                    propertys[propertys.length] = this.getName(page);
                }
                else if(qryprop == qrycons.pages.TYPE)
                {
                    propertys[propertys.length] = this.getType(page);
                }
                else if(qryprop == qrycons.pages.CONTAINER)
                {
                    propertys[propertys.length] = this.getContainer(page);
                }
                else if(qryprop == qrycons.pages.LAYOUT)
                {
                    propertys[propertys.length] = this.getLayout(page);
                }
                else if(qryprop == qrycons.pages.ALLOWEDROLES)
                {
                    propertys[propertys.length] = this.getAllowedRoles(page);
                }
                else if(qryprop == qrycons.pages.URL)
                {
                    propertys[propertys.length] = this.getURL(page);
                }
                else if(qryprop == qrycons.pages.DOCUMENTATION)
                {
                    propertys[propertys.length] = this.getDocumentation(page);
                }
                else
                {
                    propertys[propertys.length] = new MMDAO.OutputObjectProperty("Unknown Property","Value of Unknown Property");
                }
            })
        }
        return propertys;
    }

    protected getLayout(page : pages.Page) : MMDAO.OutputObjectProperty {
        var property : MMDAO.OutputObjectProperty;
        
        property = new MMDAO.OutputObjectProperty(qrycons.pages.LAYOUT,page.layoutCall.layoutQualifiedName);
        
        return property;
    }

    protected getAllowedRoles(page : pages.Page) : MMDAO.OutputObjectProperty {
        var property : MMDAO.OutputObjectProperty;

        var result : string = "";
        
        page.allowedRoles.forEach((role) => {
            result += role.qualifiedName + ", ";
        });
        
        property = new MMDAO.OutputObjectProperty(qrycons.pages.ALLOWEDROLES,result);
        
        return property;
    }

    protected getURL(page : pages.Page) : MMDAO.OutputObjectProperty {
        var property : MMDAO.OutputObjectProperty;
        
        property = new MMDAO.OutputObjectProperty(qrycons.pages.URL,page.url);
        
        return property;
    }

    

}

export class RegExAdapter extends DocumentAdapter {
    
    constructor() {
        super();   
    }

    public getRegExPropertys(regex : regularexpressions.RegularExpression, qrypropertys : string[]) : MMDAO.OutputObjectProperty[] {
        var propertys : MMDAO.OutputObjectProperty[] = new Array();
        if(qrypropertys[0] == qrycons.constants.ALL)
        {
            propertys[propertys.length] = this.getId(regex);
            propertys[propertys.length] = this.getName(regex);
            propertys[propertys.length] = this.getType(regex);
            propertys[propertys.length] = this.getContainer(regex);
            propertys[propertys.length] = this.getRegEx(regex);
            propertys[propertys.length] = this.getDocumentation(regex);   
        }
        else
        {
            qrypropertys.forEach((qryprop) => {
                if(qryprop == qrycons.regularexpressions.ID)
                {
                    propertys[propertys.length] = this.getId(regex);
                }
                else if(qryprop == qrycons.regularexpressions.NAME)
                {
                    propertys[propertys.length] = this.getName(regex);
                }
                else if(qryprop == qrycons.regularexpressions.TYPE)
                {
                    propertys[propertys.length] = this.getType(regex);
                }
                else if(qryprop == qrycons.regularexpressions.CONTAINER)
                {
                    propertys[propertys.length] = this.getContainer(regex);
                }
                else if(qryprop == qrycons.regularexpressions.REGEX)
                {
                    propertys[propertys.length] = this.getRegEx(regex);
                }
                else if(qryprop == qrycons.regularexpressions.DOCUMENTATION)
                {
                    propertys[propertys.length] = this.getDocumentation(regex);
                }
                else
                {
                    propertys[propertys.length] = new MMDAO.OutputObjectProperty("Unknown Property","Value of Unknown Property");
                }
            })
        }
        return propertys;
    }

    protected getRegEx(regex : regularexpressions.RegularExpression) : MMDAO.OutputObjectProperty {
        var property : MMDAO.OutputObjectProperty;
        
        property = new MMDAO.OutputObjectProperty(qrycons.regularexpressions.REGEX,regex.regEx);
        
        return property;
    }

}

export class SnippetAdapter extends DocumentAdapter {
    
    constructor() {
        super();   
    }

    public getSnippetPropertys(snippet : pages.Snippet, qrypropertys : string[]) : MMDAO.OutputObjectProperty[] {
        var propertys : MMDAO.OutputObjectProperty[] = new Array();
        if(qrypropertys[0] == qrycons.snippets.ALL)
        {
            propertys[propertys.length] = this.getId(snippet);
            propertys[propertys.length] = this.getName(snippet);
            propertys[propertys.length] = this.getType(snippet);
            propertys[propertys.length] = this.getContainer(snippet);
            propertys[propertys.length] = this.getEntity(snippet);
            propertys[propertys.length] = this.getDocumentation(snippet);   
        }
        else
        {
            qrypropertys.forEach((qryprop) => {
                if(qryprop == qrycons.snippets.ID)
                {
                    propertys[propertys.length] = this.getId(snippet);
                }
                else if(qryprop == qrycons.snippets.NAME)
                {
                    propertys[propertys.length] = this.getName(snippet);
                }
                else if(qryprop == qrycons.snippets.TYPE)
                {
                    propertys[propertys.length] = this.getType(snippet);
                }
                else if(qryprop == qrycons.snippets.CONTAINER)
                {
                    propertys[propertys.length] = this.getContainer(snippet);
                }
                else if(qryprop == qrycons.snippets.ENTITY)
                {
                    propertys[propertys.length] = this.getEntity(snippet);
                }
                else if(qryprop == qrycons.snippets.DOCUMENTATION)
                {
                    propertys[propertys.length] = this.getDocumentation(snippet);
                }
                else
                {
                    propertys[propertys.length] = new MMDAO.OutputObjectProperty("Unknown Property","Value of Unknown Property");
                }
            })
        }
        return propertys;
    }

    protected getEntity(snippet : pages.Snippet) : MMDAO.OutputObjectProperty {
        var property : MMDAO.OutputObjectProperty;
        
        property = new MMDAO.OutputObjectProperty(qrycons.snippets.ENTITY,snippet.entityQualifiedName);
        
        return property;
    }

}

export class ElementAdapter extends AbstractElementAdapter {
    constructor() {
        super();   
    }
}

export class WidgetAdapter extends ElementAdapter {
    constructor() {
        super();   
    }

    public getWidgetPropertys(customwidget : MMDAO.OutputObjectCounter, qrypropertys : string[]) : MMDAO.OutputObjectProperty[] {
        var propertys : MMDAO.OutputObjectProperty[] = new Array();
        if(qrypropertys[0] == qrycons.widgetscalls.ALL)
        {
            propertys[propertys.length] = this.getName(customwidget);
            propertys[propertys.length] = this.getCallType(customwidget);
            propertys[propertys.length] = this.getCallCount(customwidget);
            propertys[propertys.length] = this.getCallLocations(customwidget);   
        }
        else
        {
            qrypropertys.forEach((qryprop) => {
                if(qryprop == qrycons.widgetscalls.NAME)
                {
                    propertys[propertys.length] = this.getName(customwidget);
                }
                else if(qryprop == qrycons.widgetscalls.TYPE)
                {
                    propertys[propertys.length] = this.getCallType(customwidget);
                }
                else if(qryprop == qrycons.widgetscalls.CALLCOUNT)
                {
                    propertys[propertys.length] = this.getCallCount(customwidget);
                }
                else if(qryprop == qrycons.widgetscalls.CALLLOCATIONS)
                {
                    propertys[propertys.length] = this.getCallLocations(customwidget);
                }
                else
                {
                    propertys[propertys.length] = new MMDAO.OutputObjectProperty("Unknown Property","Value of Unknown Property");
                }
            })
        }
        return propertys;
    }

    public getName(cw : MMDAO.OutputObjectCounter) : MMDAO.OutputObjectProperty {
        var property : MMDAO.OutputObjectProperty;
        
        property = new MMDAO.OutputObjectProperty(qrycons.customwidgetscalls.NAME,cw.getPropertyValue(qrycons.customwidgetscalls.NAME));

        return property;
    }

    public getCallType(cw : MMDAO.OutputObjectCounter) : MMDAO.OutputObjectProperty {
        var property : MMDAO.OutputObjectProperty;
        
        property = new MMDAO.OutputObjectProperty(qrycons.customwidgetscalls.TYPE,cw.getPropertyValue(qrycons.customwidgetscalls.TYPE));

        return property;
    }

    public getCallCount(cw : MMDAO.OutputObjectCounter) : MMDAO.OutputObjectProperty {
        var property : MMDAO.OutputObjectProperty;
        
        property = new MMDAO.OutputObjectProperty(qrycons.customwidgetscalls.CALLCOUNT,cw.getCount().toString());

        return property;
    }

    public getCallLocations(cw : MMDAO.OutputObjectCounter) : MMDAO.OutputObjectProperty {
        var property : MMDAO.OutputObjectProperty;
        
        property = new MMDAO.OutputObjectProperty(qrycons.customwidgetscalls.CALLLOCATIONS,cw.getLocations());

        return property;
    }

    public getWidgetCounter(docs : projects.Document[]) : MMDAO.OutputObjectCounterList {
        var list : MMDAO.OutputObjectCounterList = new MMDAO.OutputObjectCounterList();
        var counter : MMDAO.OutputObjectCounter[] = new Array();
        var calls : string[];
        docs.forEach((doc) => {
                if(doc instanceof pages.Page || doc instanceof pages.Snippet || doc instanceof pages.Layout) {
                    var returnedcounter : MMDAO.OutputObjectCounter[] = new Array();
                    returnedcounter = this.traverseForWidgets(doc);
                    returnedcounter.forEach((count) => {
                        counter[counter.length] = count;
                    })
                }
            })
        calls = this.traverseForSnippetandLayoutCalls(docs);
        //Calls verarbeiten
        calls.forEach((call) => {
            docs.forEach((doc) => {
                if(doc.qualifiedName == call){
                    var returnedcounter : MMDAO.OutputObjectCounter[] = new Array();
                    returnedcounter = this.traverseForWidgets(doc);
                    returnedcounter.forEach((count) => {
                        counter[counter.length] = count;
                    })
                }
            }) 
        })    
        counter.forEach((count) => {
            list.addAndCount(count);
        })
        return list;
    }

    public traverseForSnippetandLayoutCalls(docs : projects.Document[]) : string[] {
        var names : string[] = new Array();
        docs.forEach((doc) => {
            doc.traverse((structure) => {
                if(structure instanceof pages.SnippetCall)
                {
                    names[names.length] = structure.snippetQualifiedName;
                }
                if(structure instanceof pages.LayoutCall)
                {
                    names[names.length] = structure.layoutQualifiedName;
                }
            })
        })
        return names;
    }

    public traverseForWidgets(doc : projects.Document) : MMDAO.OutputObjectCounter[] {
        var counter : MMDAO.OutputObjectCounter[] = new Array();
        doc.traverse((structure) => {
            if(structure instanceof pages.Widget && !(structure.structureTypeName === "CustomWidgets$CustomWidget")) {
                var widget_name;
                widget_name = structure.structureTypeName;
                counter[counter.length] = new MMDAO.OutputObjectCounter([new MMDAO.OutputObjectProperty("NAME",widget_name), new MMDAO.OutputObjectProperty("TYPE","Pages$Widget")],doc.qualifiedName);
            }
        });
        return counter;
    }
}

export class CustomWidgetAdapter extends WidgetAdapter {
    constructor() {
        super();   
    }

    public getCustomWidgetPropertys(customwidget : MMDAO.OutputObjectCounter, qrypropertys : string[]) : MMDAO.OutputObjectProperty[] {
        var propertys : MMDAO.OutputObjectProperty[] = new Array();
        if(qrypropertys[0] == qrycons.customwidgetscalls.ALL)
        {
            propertys[propertys.length] = this.getName(customwidget);
            propertys[propertys.length] = this.getCallType(customwidget);
            propertys[propertys.length] = this.getCallCount(customwidget);
            propertys[propertys.length] = this.getCallLocations(customwidget);   
        }
        else
        {
            qrypropertys.forEach((qryprop) => {
                if(qryprop == qrycons.customwidgetscalls.NAME)
                {
                    propertys[propertys.length] = this.getName(customwidget);
                }
                else if(qryprop == qrycons.customwidgetscalls.TYPE)
                {
                    propertys[propertys.length] = this.getCallType(customwidget);
                }
                else if(qryprop == qrycons.customwidgetscalls.CALLCOUNT)
                {
                    propertys[propertys.length] = this.getCallCount(customwidget);
                }
                else if(qryprop == qrycons.customwidgetscalls.CALLLOCATIONS)
                {
                    propertys[propertys.length] = this.getCallLocations(customwidget);
                }
                else
                {
                    propertys[propertys.length] = new MMDAO.OutputObjectProperty("Unknown Property","Value of Unknown Property");
                }
            })
        }
        return propertys;
    }

    public getCustomWidgetCounter(docs : projects.Document[]) : MMDAO.OutputObjectCounterList {
        var list : MMDAO.OutputObjectCounterList = new MMDAO.OutputObjectCounterList();
        var counter : MMDAO.OutputObjectCounter[] = new Array();
        var calls : string[];
        docs.forEach((doc) => {
                if(doc instanceof pages.Page || doc instanceof pages.Snippet || doc instanceof pages.Layout) {
                    var returnedcounter : MMDAO.OutputObjectCounter[] = new Array();
                    returnedcounter = this.traverseForCustomWidgets(doc);
                    returnedcounter.forEach((count) => {
                        counter[counter.length] = count;
                    })
                }
            })
        calls = this.traverseForSnippetandLayoutCalls(docs);
        //Calls verarbeiten
        calls.forEach((call) => {
            docs.forEach((doc) => {
                if(doc.qualifiedName == call){
                    var returnedcounter : MMDAO.OutputObjectCounter[] = new Array();
                    returnedcounter = this.traverseForCustomWidgets(doc);
                    returnedcounter.forEach((count) => {
                        counter[counter.length] = count;
                    })
                }
            }) 
        })    
        counter.forEach((count) => {
            list.addAndCount(count);
        })
        return list;
    }

    public traverseForCustomWidgets(doc : projects.Document) : MMDAO.OutputObjectCounter[] {
        var counter : MMDAO.OutputObjectCounter[] = new Array();
        doc.traverse((structure) => {
            if(structure instanceof pages.Widget && structure.structureTypeName === "CustomWidgets$CustomWidget") {
                var widget_name;
                structure.traverse((elem) => {
                    if(elem instanceof customwidgets.CustomWidgetType) {
                        var cwtype : customwidgets.CustomWidgetType;
                        cwtype = elem;
                        widget_name = cwtype.name;
                    }
                })
                counter[counter.length] = new MMDAO.OutputObjectCounter([new MMDAO.OutputObjectProperty("NAME",widget_name), new MMDAO.OutputObjectProperty("TYPE",structure.structureTypeName)],doc.qualifiedName);
            }
        });
        return counter;
    }
}