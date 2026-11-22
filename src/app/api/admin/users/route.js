import { Pool } from 'pg';

export const dynamic = 'force-dynamic';

const pool = new Pool({
  host: '172.16.1.1',
  port: 5432,
  database: 'foncier_api',
  user: 'postgres',
  password: 'mpx_secret_2026',
});

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '0');
  const size = parseInt(searchParams.get('size') || '20');
  const role = searchParams.get('role') || '';
  const q = searchParams.get('q') || '';

  try {
    let where = '';
    const params = [];
    const conditions = [];

    if (role) {
      params.push(role);
      conditions.push(`role = $${params.length}`);
    }
    if (q) {
      params.push(`%${q}%`);
      conditions.push(`(nom ILIKE $${params.length} OR prenom ILIKE $${params.length} OR telephone ILIKE $${params.length})`);
    }

    if (conditions.length > 0) {
      where = 'WHERE ' + conditions.join(' AND ');
    }

    const countResult = await pool.query(`SELECT COUNT(*) FROM utilisateur ${where}`, params);
    const total = parseInt(countResult.rows[0].count);

    const offset = page * size;
    const dataParams = [...params, size, offset];
    const dataResult = await pool.query(
      `SELECT id, telephone, nom, prenom, email, role, photo_url, nni, kyc_verifie, cree_le, dernier_acces, plan, langue, statut_kyc
       FROM utilisateur ${where}
       ORDER BY cree_le DESC
       LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
      dataParams
    );

    return Response.json({
      content: dataResult.rows,
      totalPages: Math.ceil(total / size),
      totalElements: total,
    });
  } catch (err) {
    console.error('DB error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}