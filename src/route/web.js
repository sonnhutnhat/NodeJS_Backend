import express from "express";
import homeController from "../controllers/homeController";
import userController from "../controllers/userController"
let router = express.Router();

let initViewRoutes = (app) => {
    router.get("/", homeController.getHomePage);
    router.get("/about", homeController.getAbout);
    router.get("/crud", homeController.getCRUD);

    router.post("/post-crud", homeController.postCRUD);
    router.get("/get-crud", homeController.displayGetCRUD);
    router.get("/edit-crud", homeController.getEditCRUD);
    router.post("/put-crud", homeController.putCRUD);

    router.get("/delete-crud", homeController.deleteCRUD);

    router.post('/api/login', userController.handleLogin)
    router.get("/api/get-all-users", userController.handleGetAllUser);

    return app.use('/', router);
}

module.exports = initViewRoutes;
