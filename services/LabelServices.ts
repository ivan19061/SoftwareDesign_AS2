import {count, pick} from "better-sqlite3-proxy";
import {proxy} from "../proxy";

export class LabelService{

    getLabels() {
        
        return pick(proxy.label,["id","name"]);

    }


    countimagebyLabel(label_id:number){
    
    //select count form image_label where l

    return count (proxy.image_label,{label_id})
        
    }
    deleteLabel(label_id: number){

        delete proxy.label[label_id]
    }

}
