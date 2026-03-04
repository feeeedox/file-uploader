import { PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

export default defineEventHandler(async (event) => {

    const apiKey = getHeader(event, 'x-api-key');

    const exists = await prisma.accounts.findFirst({
        where: {
            uploadKey: apiKey
        }
    })

    if (!exists) {
        return {
            success: false,
            message: 'Invalid API Key'
        }
    }

    const formData = await readMultipartFormData(event);

    if (!formData) {
        return {
            success: false,
            message: 'No form data provided'
        }
    }

    console.log('Received formData:', formData);

    const file = formData[0];

    if (!file) {
        return {
            success: false,
            message: 'No file provided'
        }
    }

    const fileExtension = file.filename?.split('.').pop();
    const newFileName = `${randomUUID()}.${fileExtension}`;

    try {
        const command = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: newFileName,
            Body: file.data,
            ContentType: file.type,
        });

        await s3.send(command);

        await prisma.upload.create({
            data: {
                fileName: newFileName,
                originalFileName: file.filename || 'unknown',
                contentType: file.type || 'application/octet-stream',
                size: file.data.length,
                accountId: exists.id,
            },
        });

        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

        const fileUrl = `${baseUrl}/api/u/${newFileName}`;

        return {
            success: true,
            message: 'File uploaded successfully',
            url: fileUrl,
        };

    } catch (error) {
        console.error('Error uploading to S3:', error);
        return {
            success: false,
            message: 'Error uploading file',
        };
    }
});