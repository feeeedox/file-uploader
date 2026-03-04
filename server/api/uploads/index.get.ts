export default defineEventHandler(async (event) => {
    const apiKey = getHeader(event, 'x-api-key');

    if (!apiKey) {
        return {
            success: false,
            message: 'API key is required',
        };
    }

    const account = await prisma.accounts.findUnique({
        where: { uploadKey: apiKey },
        include: {
            uploads: {
                orderBy: {
                    createdAt: 'desc',
                },
            },
        },
    });

    if (!account) {
        return {
            success: false,
            message: 'Invalid API key',
        };
    }

    return {
        success: true,
        uploads: account.uploads,
    };
});
