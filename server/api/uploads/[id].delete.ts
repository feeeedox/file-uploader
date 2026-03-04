import { DeleteObjectCommand } from '@aws-sdk/client-s3';

export default defineEventHandler(async (event) => {
    const apiKey = getHeader(event, 'x-api-key');
    const uploadId = event.context.params?.id as string;

    if (!apiKey) {
        return {
            success: false,
            message: 'API key is required',
        };
    }

    const account = await prisma.accounts.findUnique({
        where: { uploadKey: apiKey },
    });

    if (!account) {
        return {
            success: false,
            message: 'Invalid API key',
        };
    }

    const upload = await prisma.upload.findUnique({
        where: { id: uploadId },
    });

    if (!upload || upload.accountId !== account.id) {
        return {
            success: false,
            message: 'Upload not found or you do not have permission to delete it.',
        };
    }

    try {
        const command = new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: upload.fileName,
        });
        await s3.send(command);

        await prisma.upload.delete({
            where: { id: uploadId },
        });

        return {
            success: true,
            message: 'Upload deleted successfully.',
        };
    } catch (error) {
        console.error('Error deleting from S3 or DB:', error);
        return {
            success: false,
            message: 'Failed to delete upload.',
        };
    }
});
