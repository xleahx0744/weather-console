require('dotenv').config({ path: './db.env', debug: true });

const express = require('express');
const startIngestion = require('./src/jobs/ingestion.job.js');
const cors = require('cors')

const riskRouter = require('./src/routes/alerts.routes.js')

const app = express();
app.use(cors());
const PORT = 8000

app.use(express.json());

app.use('/info', riskRouter)


app.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}`);
    startIngestion();
})