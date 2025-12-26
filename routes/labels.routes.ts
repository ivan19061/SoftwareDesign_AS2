import { Router } from "express";
import { LabelService } from "../services/LabelServices";
import { LabelController } from "../controllers/label.controller";
import { handleRequest } from "../helpers/handle-request";

let routes = Router();
let service = new LabelService();
let controller = new LabelController(service);

routes.get("/labels", (req, res) => {
  handleRequest(res, () => controller.getLabels(req));
});

routes.delete("/labels/:id", (req, res) => {
  handleRequest(res, () => controller.deleteLabel(req));
});


export let labelRoutes = routes;