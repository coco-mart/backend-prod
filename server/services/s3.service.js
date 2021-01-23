import AWS from "aws-sdk";
AWS.config.update({ region: "us-east-2" });
const s3 = new AWS.S3({ apiVersion: "2006-03-01" });

export const uploadImages = (mobile, postId, files) => {
    let BucketPath = `cocomart-test/${mobile}/${postId}`;
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
