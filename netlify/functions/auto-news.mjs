/** Netlify Scheduled Function — her dakika AI haber motorunu tetikler */
export async function handler() {
  const base = process.env.URL || process.env.DEPLOY_PRIME_URL;
  if (!base) {
    return { statusCode: 500, body: "URL env missing" };
  }

  const headers = {};
  if (process.env.CRON_SECRET) {
    headers.Authorization = `Bearer ${process.env.CRON_SECRET}`;
  }

  try {
    const res = await fetch(`${base}/api/cron/auto-news`, { headers });
    const body = await res.text();
    return { statusCode: res.status, body };
  } catch (err) {
    return {
      statusCode: 500,
      body: err instanceof Error ? err.message : "Cron fetch failed",
    };
  }
}

export const config = {
  schedule: "* * * * *",
};
