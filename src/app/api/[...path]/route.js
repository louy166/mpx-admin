const BACKEND = process.env.BACKEND_URL || 'http://31.97.69.178:8082';

async function handler(req, { params }) {
    const { path } = await params;
    const target = `${BACKEND}/${path.join('/')}`;
    const url = new URL(target);
    const searchParams = new URL(req.url).searchParams;
    searchParams.forEach((v, k) => url.searchParams.set(k, v));

    const headers = new Headers();
    headers.set('Content-Type', req.headers.get('content-type') || 'application/json');
    const auth = req.headers.get('authorization');
    if (auth) headers.set('Authorization', auth);

    const opts = { method: req.method, headers };
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        opts.body = await req.text();
    }

    const res = await fetch(url.toString(), opts);
    const data = await res.text();

    return new Response(data, {
        status: res.status,
        headers: { 'Content-Type': res.headers.get('content-type') || 'application/json' },
    });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;