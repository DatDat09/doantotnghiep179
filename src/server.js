require('dotenv').config();
const express = require('express');
const path = require('path');
const configViewEngine = require('./config/viewEngine');
const fileUpload = require('express-fileupload');
const feRoutes = require('./routes/feapi');
const connection = require('./config/database');

const app = express();
const port = process.env.PORT || 3333;
const hostname = process.env.HOSTNAME;

app.use(fileUpload({ useTempFiles: true, tempFileDir: '/tmp/' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

configViewEngine(app);

app.use('/', feRoutes);

(async () => {
  try {
    await connection();
    app.listen(port, hostname, () => {
      console.log(`Backend app listening on port ${port}`);
    });
  } catch (error) {
    console.log(">>> Error connect db", error);
  }
})();
