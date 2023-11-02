import SqsUtils from "./utils/sqsUtils.js";
import AWS from "aws-sdk";
import express from "express";


const app = express();

try {

    AWS.config.update({
        region: "ap-southeast-2"
    });

    const sqsUtils = new SqsUtils(AWS);
    sqsUtils.startPolling();
} catch (e) {
    throw e;
}

app.get("/", (req, res) => {
    res.status(200).send("Hello World!");
});

app.listen(3002, () => {
    console.log("SQS app listening on port 3000!");
});