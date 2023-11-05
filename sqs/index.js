import SqsUtils from "./utils/sqsUtils.js";
import AWS from "aws-sdk";

AWS.config.update({
    region: "ap-southeast-2"
});

/**
 * Creates a new instance of SqsUtils with the provided AWS object.
 * Uses SQS queue to poll for new messages.
 * @param {Object} AWS - The AWS object to use for creating the SqsUtils instance.
 * @returns {SqsUtils} A new instance of SqsUtils.
 */

const sqsUtils = new SqsUtils(AWS);
sqsUtils.startPolling();

