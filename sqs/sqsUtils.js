
class SqsUtils {
    constructor(aws) {
        this.sqs = new aws.SQS({
            endpoint: "https://sqs.ap-southeast-2.amazonaws.com/901444280953/cab432group109"
        });
    }

    // Method to print jobs from the SQS queue
    printJobs() {
        const params = {
            QueueUrl: this.sqs.endpoint.href, // Use the endpoint URL as the queue URL
            MaxNumberOfMessages: 10 // Adjust based on how many messages you want to retrieve
        };

        this.sqs.receiveMessage(params, (err, data) => {
            if (err) {
                console.error("Error retrieving messages from SQS:", err);
            } else {
                if (data.Messages && data.Messages.length > 0) {
                    data.Messages.forEach((message) => {
                        console.log("Message: ", message.Body);
                        // Optionally, you can also delete the message after processing
                        // this.deleteMessage(message.ReceiptHandle);
                    });
                } else {
                    console.log("No messages found in the queue.");
                }
            }
        });
    }

    // Optional method to delete a message after processing
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
}

export default SqsUtils;