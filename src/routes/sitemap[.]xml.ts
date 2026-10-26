import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = "https://rachna2k26.lovable.app";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/events", changefreq: "weekly", priority: "0.9" },
          { path: "/schedule", changefreq: "weekly", priority: "0.8" },
          { path: "/register", changefreq: "weekly", priority: "0.9" },
          { path: "/contact", changefreq: "monthly", priority: "0.5" },
        ];

        try {
          const supabase = createClient(
            process.env["VITE_SUPABASE_URL"]!,
            process.env["VITE_SUPABASE_PUBLISHABLE_KEY"]!,
            { auth: { persistSession: false } },
          );
          const { data } = await supabase
            .from("events")
            .select("slug, registrable")
            .order("sort_order", { ascending: true });
          const rows = [...(data ?? [])];
          if (!rows.some((r) => r.slug === "engifusion")) {
            rows.push({ slug: "engifusion", registrable: true });
          }
          for (const row of rows) {
            if (row.registrable) {
              entries.push({
                path: `/register/${row.slug}`,
                changefreq: "weekly",
                priority: "0.7",
              });
            }
          }
        } catch (error) {
          console.error("sitemap: could not load events", error);
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
