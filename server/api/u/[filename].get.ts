import { GetObjectCommand } from '@aws-sdk/client-s3';

export default defineEventHandler(async (event) => {
    const filename = event.context.params?.filename;

    if (!filename) {
        return {
            success: false,
            message: 'No filename provided',
        };
    }

    try {
        const command = new GetObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: filename,
        });

        const { Body, ContentType } = await s3.send(command);

        if (ContentType) {
            setHeader(event, 'Content-Type', ContentType);
        }

        return Body;
    } catch (error: any) {
        if (error.name === 'NoSuchKey') {
            setResponseStatus(event, 404);
            return {
                success: false,
                message: 'File not found',
            };
        }

        console.error('Error fetching from S3:', error);
        setResponseStatus(event, 500);
        return {
            success: false,
            message: 'Error fetching file',
        };
    }
});
