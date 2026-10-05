import type { APIRoute } from 'astro';
import { listOffers } from '../../lib/job-offers';

export const prerender = true;

export const GET: APIRoute = () => {
  const offers = listOffers();
  return new Response(JSON.stringify({ offers, generatedAt: new Date().toISOString() }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
};
