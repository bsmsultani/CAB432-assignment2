
class S3Utils {
    constructor(aws) {
        this.s3 = new aws.S3();
        this.bucketName = "cab432group100";
    }

    async getObject (key) {
        const params = {
            Bucket: this.bucketName,
            Key: key
        };

        try {
            const data = await this.s3.getObject(params).promise();
            return data;
        } catch (error) {
            console.error("Error getting object:", error);
            throw error;
        }
    }
    

    async getSignedUrl(key) {
        const params = {
            Bucket: this.bucketName,
            Key: key,
            Expires: 60
        };

        try {
            const url = await this.s3.getSignedUrlPromise("getObject", params);
            return url;
        } catch (error) {
            console.error("Error getting signed URL:", error);
            throw error;
        }
    }
    
    async getSignedUrlForUpload(key, contentType = 'video/mp4') {
        const params = {
            Bucket: this.bucketName,
            Key: key,
            Expires: 600, // URL will expire in 60 seconds
            ContentType: contentType
        };
    
        try {
            const url = await this.s3.getSignedUrlPromise("putObject", params);
            return url;
        } catch (error) {
            console.error("Error getting signed URL for upload:", error);
            throw error;
        }
    }    


    async listBucketContents() {
        const params = {
            Bucket: this.bucketName
        };

        try {
            const data = await this.s3.listObjectsV2(params).promise();
            return data.Contents;
        } catch (error) {
            console.error("Error listing bucket contents:", error);
            throw error;
        }
    }
}

export default S3Utils