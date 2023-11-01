

class S3Utils {
    constructor(aws) {
        this.s3 = new aws.S3();
        this.bucketName = "cab432group100";
    }

    async getObject(key) {
        const params = {
            Bucket: this.bucketName,
            Key: key
        };
        return await this.s3.getObject(params).promise();
    }

}

export default S3Utils