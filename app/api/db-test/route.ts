import { NextResponse } from 'next/server';
import { checkDbConnection, pool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const result: any = {
    mysql: { connected: false },
    timestamp: new Date().toISOString(),
  };

  // Test MySQL connection
  try {
    const connCheck = await checkDbConnection();
    if (!connCheck.isConnected) {
      result.mysql = {
        connected: false,
        error: connCheck.error || 'Connection failed to 127.0.0.1:3306',
      };
    } else {
      const [jRows]: any = await pool.query('SELECT COUNT(*) as count FROM jamaah');
      const [zRows]: any = await pool.query('SELECT COUNT(*) as count FROM zawiyah');
      const [uRows]: any = await pool.query('SELECT COUNT(*) as count FROM users');
      result.mysql = {
        connected: true,
        database: 'dashboard_zawiyah',
        jamaah: jRows[0].count,
        zawiyah: zRows[0].count,
        users: uRows[0].count,
      };
    }
  } catch (err: any) {
    result.mysql = {
      connected: false,
      error: err.message,
    };
  }

  return NextResponse.json({
    success: result.mysql.connected,
    activeEngine: result.mysql.connected ? 'MySQL (dashboard_zawiyah - phpMyAdmin)' : 'Offline',
    ...result,
  });
}
