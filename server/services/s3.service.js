import AWS from "aws-sdk";
import "regenerator-runtime/runtime";
AWS.config.update({ region: "us-east-2" });
const s3 = new AWS.S3({ apiVersion: "2006-03-01" });

export const uploadImages = (mobile, postId, files) => {
    let BucketPath = `${process.env.S3_BUCKET_NAME}/${mobile}/${postId}`;
    //Where you want to store your file
    const data = files.map((item) => {
        let params = {
            Bucket: BucketPath,
            Key: item.originalname,
            Body: item.buffer,
            ACL: "public-read",
        };
        return s3.upload(params).promise();
    });
    return data;
};

export const emptyS3Directory = async (mobile, postId) => {
    let Bucket = process.env.S3_BUCKET_NAME;
    const listParams = {
        Bucket,
        Prefix: `${mobile}/${postId}`,
    };

    const listedObjects = await s3.listObjectsV2(listParams).promise();
    if (listedObjects.Contents.length === 0) return;
    const deleteParams = {
        Bucket,
        Delete: { Objects: [] },
    };
    listedObjects.Contents.forEach(({ Key }) => {
        deleteParams.Delete.Objects.push({ Key });
    });
    await s3.deleteObjects(deleteParams).promise();
    let response;
    if (listedObjects.IsTruncated)
        response = await emptyS3Directory(mobile, postId);
    return response;
};
