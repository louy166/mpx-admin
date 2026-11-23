import { Pool } from 'pg';
export const dynamic = 'force-dynamic';
const pool = new Pool({
  host: process.env.DB_HOST || '172.16.1.1',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'foncier_api',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'mpx_secret_2026',
});
export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const newStatus = body.status;
    if (!['brouillon','en_verification','publie','rejete'].includes(newStatus)) {
      return Response.json({ error: 'Statut invalide' }, { status: 400 });
    }
    await pool.query('UPDATE bien SET statut = , date_modification = NOW() WHERE id = ', [newStatus, id]);
    return Response.json({ success: true, status: newStatus });
  } catch (err) {
    console.error('DB error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
