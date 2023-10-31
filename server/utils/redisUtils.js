class RedisUtils {
    constructor(redisClient, videoHash) {
        this.redisClient = redisClient;
    }

    async isVideoProcessed() {
        try {
            const isProcessed = await this.redisClient.sIsMember("processed_videos", this.videoHash);
            console.log('isProcessed', isProcessed);
            return isProcessed;
        }
        catch (err) { throw err; }
    }

    async markVideoAsProcessed() {
        try { await this.redisClient.sAdd("processed_videos", this.videoHash); }
        catch (err) { throw err; }
    }

}

export default RedisUtils;