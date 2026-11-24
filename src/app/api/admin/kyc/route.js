import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: '31.97.69.178',
  port: 5432,
  database: 'foncier_api',
  user: 'postgres',
  password: 'mpx_secret_2026',
  ssl: false,
});

function fixUrl(url) {
  if (!url) return null;
  return url.replace('http://localhost:8080', 'http://31.97.69.178:8083');
}

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT id, nom, prenom, telephone, email, nni, statut_kyc, kyc_verifie,
              kyc_recto_url, kyc_verso_url, kyc_selfie_url
       FROM utilisateur
       WHERE nni IS NOT NULL
       ORDER BY nni`
    );
    const rows = result.rows.map(r => ({
      ...r,
      kyc_recto_url: fixUrl(r.kyc_recto_url),
      kyc_verso_url: fixUrl(r.kyc_verso_url),
      kyc_selfie_url: fixUrl(r.kyc_selfie_url),
    }));
    return NextResponse.json(rows);
  } catch (err) {
    console.error('KYC GET error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { userId, decision } = await request.json();
    const statut = decision === 'verifie' ? 'verifie' : 'rejete';
    const verifie = decision === 'verifie';
    await pool.query(
      'UPDATE utilisateur SET statut_kyc = $1, kyc_verifie = $2 WHERE id = $3',
      [statut, verifie, userId]
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('KYC PUT error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}