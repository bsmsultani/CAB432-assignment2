/**
 * RedisUtils class for handling Redis operations related to video processing.
 */

class RedisUtils {
    /**
     * Creates an instance of RedisUtils.
     * @param {Object} redisClient - Redis client instance.
     * @param {string} videoHash - Hash of the video to be processed.
     */
    constructor(redisClient, videoHash) {
        this.redisClient = redisClient;
        this.videoHash = videoHash;
    }

    /**
     * Checks if the video has already been processed.
     * @returns {Promise<boolean>} - Promise that resolves to a boolean indicating if the video has been processed.
     * @throws {Error} - Throws an error if there is an issue with the Redis operation.
     */
    async isVideoProcessed() {
        try {
            const isProcessed = await this.redisClient.sIsMember("processed_videos", this.videoHash);
            console.log('isProcessed', isProcessed);
            return isProcessed;
        }
        catch (err) { throw err; }
    }

    /**
     * Marks the video as processed by adding it to the set of processed videos.
     * @throws {Error} - Throws an error if there is an issue with the Redis operation.
     */
    async markVideoAsProcessed() {
        try { await this.redisClient.sAdd("processed_videos", this.videoHash); }
        catch (err) { throw err; }
    }

    /**
     * Deletes the video from the set of processed videos.
     * @throws {Error} - Throws an error if there is an issue with the Redis operation.
     */
    async deleteVideoFromProcessed() {
        try { await this.redisClient.sRem("processed_videos", this.videoHash); }
        catch (err) { throw err; }
    }

}

export default RedisUtils;