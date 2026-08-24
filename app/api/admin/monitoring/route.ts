import { NextResponse } from 'next/server';
import { getAdminAuditLogs } from '@/lib/service';
import { getApiErrorSummary } from '@/lib/api-error';

export async function GET() {
  try {
    const [audit, errors] = await Promise.all([
      getAdminAuditLogs(100),
      getApiErrorSummary(100),
    ]);
    return NextResponse.json({ audit, errors });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Không thể tải dữ liệu giám sát.' }, { status: 500 });
  }
}
