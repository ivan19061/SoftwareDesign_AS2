import { Request } from "express";
import { HttpError } from "../errors/http-error"
import HttpStatus from "http-status";
import { LabelService } from "../services/LabelServices";

export class LabelController{

    constructor (public Labelservice: LabelService){}
    getLabels (req:Request){
        let labels= this.Labelservice.getLabels();
        return{labels};
    }

    deleteLabel(req:Request){
        let label_id =+req.params.id
        if(!label_id){

            throw new HttpError(HttpStatus.BAD_REQUEST,"invalid label")
        }

        let imageCount = this.Labelservice.countimagebyLabel(label_id)
        if (imageCount>0){
            throw new HttpError(HttpStatus.NOT_ACCEPTABLE,`this label is use by ${imageCount} images`)

        }

        

        this.Labelservice.deleteLabel(label_id)
        return{};

    //     if ("1"){
    //     throw new HttpError(HttpStatus.FORBIDDEN,"Only admin can delete label");
    // }
    
    }
}