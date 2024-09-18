import express from "express";
import bodyParser from "body-parser";
import viewEngine from "./config/viewEngine";
import initWebRoutes from "./route/web";
import connectBD from "./config/connectDB";
import cors from 'cors';

require('dotenv').config();

let app = express();
app.use(cors({ credentials: true, origin: true }));
//config app
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

viewEngine(app);
initWebRoutes(app);

connectBD();

let port = process.env.PORT || 6969;
//Port === indefind => port = 6969.

app.listen(port, () => {
    //call back 
    console.log("Backend Nodejs is running on the port:  " + port);
});