export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Backend routes will live here
    if (url.pathname.startsWith("/api/")) {
      return new Response(JSON.stringify({ message: "API is alive" }), {
        headers: { "content-type": "application/json" },
      });
    }

    // Everything else falls through to your existing static assets (the SPA)
    return env.ASSETS.fetch(request);
  },
};