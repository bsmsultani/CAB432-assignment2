import SqsUtils from "./utils/sqsUtils.js";
import AWS from "aws-sdk";

AWS.config.update({
    region: "ap-southeast-2"
});


const sqsUtils = new SqsUtils(AWS);
sqsUtils.startPolling();
