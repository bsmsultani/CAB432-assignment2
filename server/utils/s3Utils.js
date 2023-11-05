
/**
 * A utility class for interacting with AWS S3.
 */

class S3Utils {
    /**
     * Creates an instance of S3Utils.
     * @param {Object} aws - The AWS SDK object.
     */
    constructor(aws) {
        this.s3 = new aws.S3();
        this.bucketName = "cab432group100";
    }

    /**
     * Gets an object from S3.
     * @param {string} key - The key of the object to get.
     * @returns {Promise<Object>} - A promise that resolves to the object data.
     * @throws {Error} - If there was an error getting the object.
     */
    async getObject (key) {
        const params = {
            Bucket: this.bucketName,
            Key: key
        };

        try {
            const data = await this.s3.getObject(params).promise();
            return data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Gets all objects in a folder in S3.
     * @param {string} folder - The folder to get objects from.
     * @returns {Promise<Array<Object>>} - A promise that resolves to an array of objects in the folder.
     * @throws {Error} - If there was an error getting the objects.
     */
    async getObjectsInFolder (folder) {
        const params = {
            Bucket: this.bucketName,
            Prefix: folder
        };

        try {
            const data = await this.s3.listObjectsV2(params).promise();
            return data.Contents;
        } catch (error) {
            console.error("Error getting objects in folder:", error);
            throw error;
        }
    }
    

    /**
     * Gets a signed URL for an object in S3.
     * @param {string} key - The key of the object to get a signed URL for.
     * @returns {Promise<string>} - A promise that resolves to the signed URL.
     * @throws {Error} - If there was an error getting the signed URL.
     */
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
    
    /**
     * Gets a signed URL for uploading an object to S3.
     * @param {string} key - The key of the object to get a signed URL for.
     * @param {string} [contentType='video/mp4'] - The content type of the object.
     * @returns {Promise<string>} - A promise that resolves to the signed URL.
     * @throws {Error} - If there was an error getting the signed URL.
     */
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


    /**
     * Lists all objects in the S3 bucket.
     * @returns {Promise<Array<Object>>} - A promise that resolves to an array of all objects in the bucket.
     * @throws {Error} - If there was an error listing the bucket contents.
     */
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