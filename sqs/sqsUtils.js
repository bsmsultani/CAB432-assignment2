class SqsUtils {
    constructor(aws) {
        this.sqs = new aws.SQS({
            endpoint: "https://sqs.ap-southeast-2.amazonaws.com/901444280953/cab432group109"
        });
    }

    // Method to start polling the SQS queue
    startPolling() {
        console.log("Starting SQS polling...");

        const poll = () => {
            const params = {
                QueueUrl: this.sqs.endpoint.href,
                MaxNumberOfMessages: 10, // Adjust based on how many messages you want to retrieve
                WaitTimeSeconds: 20 // Enable long polling (up to 20 seconds)
            };

            this.sqs.receiveMessage(params, (err, data) => {
                if (err) {
                    console.error("Error retrieving messages from SQS:", err);
                } else {
                    if (data.Messages && data.Messages.length > 0) {
                        data.Messages.forEach((message) => {
                            console.log("Processing message: ", message.Body);
                            // Process the message here
                            // Optionally, you can also delete the message after processing
                            // this.deleteMessage(message.ReceiptHandle);
                        });
                    } else {
                        console.log("No messages found in the queue.");
                    }

                    // Continue polling
                    poll();
                }
            });
        };

        // Start the polling process
        poll();
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

