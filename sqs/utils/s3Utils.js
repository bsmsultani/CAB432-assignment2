

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

    async putObject(key, body) {
        const params = {
            Bucket: this.bucketName,
            Key: key,
            Body: body
        };
        return await this.s3.putObject(params).promise();
    }

    async uploadObject(key, body) {
        const params = {
            Bucket: this.bucketName,
            Key: key,
            Body: body
        };
        return await this.s3.upload(params).promise();
    }

}

export default S3Utils