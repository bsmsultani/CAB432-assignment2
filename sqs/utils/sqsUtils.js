import Analyser from "./analyser.js"; 
import S3Utils from "./s3Utils.js";

class SqsUtils {
    constructor(aws) {
        this.sqs = new aws.SQS({
            endpoint: "https://sqs.ap-southeast-2.amazonaws.com/901444280953/cab432group109"
        });

        const s3Utils = new S3Utils(aws);
        this.analyser = new Analyser(s3Utils);
    }

    startPolling() {
        console.log("Starting SQS polling...");

        const poll = () => {
            const params = {
                QueueUrl: this.sqs.endpoint.href,
                MaxNumberOfMessages: 5,
                WaitTimeSeconds: 20
            };

            this.sqs.receiveMessage(params, (err, data) => {
                if (err) { 
                    console.error("Error retrieving messages from SQS:", err);
                } else {
                    if (data.Messages && data.Messages.length > 0) {

                        data.Messages.forEach(async message => {
                            try {

                                this.extendMessageVisibility(message.ReceiptHandle, 30);

                                const parsedBody = JSON.parse(message.Body);
                        
                                const records = parsedBody.Records;
                                if (records && records.length > 0) {
                                    const eventName = records[0].eventName;
                                    const key = records[0].s3.object.key;
                                    if (eventName !== "ObjectCreated:Put") { throw new Error("Event name is not ObjectCreated:Put"); }
                                    if (!key) { throw new Error("Key is not present"); }

                                    await this.analyser.analyseVideo(key);
                        
                                }

                                else { throw new Error("No records found in message body"); }
                            } catch (error) {
                                console.error("Error parsing message body: ", error);
                            } finally {
                                this.deleteMessage(message.ReceiptHandle);
                            }

                        });
                        
                    } else {
                        console.log("No messages found in the queue.");
                    }
                }

                setTimeout(poll, 0);
            });
        };

        poll();
    }

    deleteMessage(receiptHandle) {
        const deleteParams = {
            QueueUrl: this.sqs.endpoint.href,
            ReceiptHandle: receiptHandle
        };

        this.sqs.deleteMessage(deleteParams, (err, data) => {
            if (err) {
                console.error("Error deleting message from SQS:", err);
            } else {
                console.log("Message deleted successfully");
            }
        });
    }

    extendMessageVisibility(receiptHandle, seconds) {
        const params = {
            QueueUrl: this.sqs.endpoint.href,
            ReceiptHandle: receiptHandle,
            VisibilityTimeout: seconds
        };

        this.sqs.changeMessageVisibility(params, (err, data) => {
            if (err) {
                console.error("Error extending message visibility:", err);
            } else {
                console.log("Message visibility extended successfully");
            }
        });
    }
}

export default SqsUtils;
