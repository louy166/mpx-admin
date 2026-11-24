import { Pool } from 'pg';
export const dynamic = 'force-dynamic';
const pool = new Pool({
  host: process.env.DB_HOST || '172.16.1.1',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'foncier_api',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'mpx_secret_2026',
});

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const perPage = parseInt(url.searchParams.get('per_page') || '20');
    const offset = (page - 1) * perPage;

    const countR = await pool.query('SELECT COUNT(*) FROM notification');
    const total = parseInt(countR.rows[0].count);

    const dataR = await pool.query(
      `SELECT n.id, n.titre, n.message, n.type, n.lu, n.cree_le, n.metadata,
              u.prenom, u.nom, u.telephone
       FROM notification n
       LEFT JOIN utilisateur u ON n.utilisateur_id = u.id
       ORDER BY n.cree_le DESC
       LIMIT $1 OFFSET $2`,
      [perPage, offset]
    );

    const data = dataR.rows.map(r => ({
      id: r.id,
      titre: r.titre,
      message: r.message,
      type: r.type,
      lu: r.lu,
      created_at: r.cree_le,
      metadata: r.metadata,
      destinataire: r.prenom || r.nom ? `${r.prenom || ''} ${r.nom || ''}`.trim() : r.telephone,
    }));

    return Response.json({ data, total, page, per_page: perPage, total_pages: Math.ceil(total / perPage) });
  } catch (err) {
    console.error('DB error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { titre, message, type, utilisateur_id } = body;

    if (!titre || !message) {
      return Response.json({ error: 'Titre et message requis' }, { status: 400 });
    }

    // Si utilisateur_id specifique, envoyer a cet utilisateur. Sinon, envoyer a tous.
    if (utilisateur_id) {
      await pool.query(
        `INSERT INTO notification (id, cree_le, maj_le, lu, message, metadata, titre, type, utilisateur_id)
         VALUES (gen_random_uuid(), NOW(), NOW(), false, $1, '{}', $2, $3, $4)`,
        [message, titre, type || 'info', utilisateur_id]
      );
    } else {
      const users = await pool.query('SELECT id FROM utilisateur');
      for (const u of users.rows) {
        await pool.query(
          `INSERT INTO notification (id, cree_le, maj_le, lu, message, metadata, titre, type, utilisateur_id)
           VALUES (gen_random_uuid(), NOW(), NOW(), false, $1, '{}', $2, $3, $4)`,
          [message, titre, type || 'info', u.id]
        );
      }
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error('DB error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
