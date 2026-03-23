export async function load({ fetch }) {
  const res = await fetch('/api/filings/public');
  const filings = await res.json();

  return { filings };
}