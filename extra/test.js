import S3Utils from "../server/utils/s3Utils.js";
import AWS from "aws-sdk";
import path from "path";

AWS.config.update({
    region: "ap-southeast-2"
});

const s3 = new S3Utils(AWS);

const folderHash = "679b98a2d08e62931344bacac5dfbf507ff1f455f4db8e1aa3cd62d5a565f4ce/graphs";

(async () => {
    try {
        const objectKeys = await s3.getObjectsInFolder(folderHash);
        const data = {};
        for (const objectKey of objectKeys) {
            const graphName = path.basename(objectKey.Key);
            console.log(graphName);
            const result = await s3.getObject(objectKey.Key);

            // Assuming result.Body is a Buffer, convert it to a UTF-8 string
            const utf8String = result.Body.toString('utf-8');

            console.log(utf8String);

            data[graphName] = utf8String;
        }
        
        console.log(data);
    } catch (err) {
        console.error(err);
    }
})();
