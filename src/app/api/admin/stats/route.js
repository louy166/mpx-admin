import { Pool } from 'pg';

export const dynamic = 'force-dynamic';

const pool = new Pool({
  host: process.env.DB_HOST || '172.16.1.1',
  port: 5432,
  database: 'foncier_api',
  user: 'postgres',
  password: 'mpx_secret_2026',
});

export async function GET() {
  try {
    const [props, users, kyc] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM bien'),
      pool.query('SELECT COUNT(*) FROM utilisateur'),
      pool.query("SELECT COUNT(*) FROM utilisateur WHERE kyc_verifie = false"),
    ]);

    return Response.json({
      total_properties: parseInt(props.rows[0].count),
      total_users: parseInt(users.rows[0].count),
      pending_kyc: parseInt(kyc.rows[0].count),
      total_revenue: 0,
    });
  } catch (err) {
    console.error('DB error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
