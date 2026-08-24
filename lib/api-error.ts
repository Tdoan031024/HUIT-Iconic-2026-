import prisma from './prisma';

export async function logApiError(request: Request, statusCode: number, error: unknown) {
  try {
    const url = new URL(request.url);
    const message = error instanceof Error ? error.message : String(error || 'Lỗi không xác định');
    await prisma.apiErrorLog.create({
      data: {
        method: request.method,
        path: url.pathname,
        statusCode,
        message,
        stack: error instanceof Error ? error.stack : undefined,
        ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    });
  } catch (logError) {
    console.error('[API_ERROR_LOG_FAILED]', logError);
  }
}

export async function getApiErrorSummary(limit = 100) {
  const [logs, total, recentCount] = await Promise.all([
    prisma.apiErrorLog.findMany({ orderBy: { createdAt: 'desc' }, take: limit }),
    prisma.apiErrorLog.count(),
    prisma.apiErrorLog.count({ where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
  ]);
  return { logs, total, recentCount };
}
