import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer, Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import React from "react";

// Register a clean font
Font.register({
  family: "Helvetica",
  fonts: [],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    padding: 40,
    backgroundColor: "#ffffff",
    fontSize: 10,
    color: "#1f2937",
  },
  // Cover Header
  header: {
    backgroundColor: "#1d4ed8",
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  headerSub: {
    fontSize: 11,
    color: "#bfdbfe",
    lineHeight: 1.5,
  },
  weatherBadge: {
    backgroundColor: "#3b82f6",
    borderRadius: 8,
    padding: "6 10",
    marginTop: 10,
  },
  weatherText: {
    color: "#fff",
    fontSize: 9,
  },
  // Section
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1e40af",
    borderBottomWidth: 2,
    borderBottomColor: "#bfdbfe",
    paddingBottom: 4,
    marginBottom: 12,
    marginTop: 18,
  },
  // Budget Chip
  budgetRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 12,
  },
  chip: {
    backgroundColor: "#eff6ff",
    borderRadius: 20,
    padding: "4 10",
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  chipText: {
    color: "#1d4ed8",
    fontSize: 9,
    fontWeight: "bold",
  },
  // Hotel Card
  hotelCard: {
    backgroundColor: "#fafafa",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#f97316",
  },
  hotelName: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 3,
  },
  hotelPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#059669",
    marginBottom: 3,
  },
  hotelDesc: {
    fontSize: 9,
    color: "#6b7280",
    lineHeight: 1.4,
    marginBottom: 3,
  },
  hotelAddr: {
    fontSize: 8,
    color: "#9ca3af",
  },
  stars: {
    fontSize: 10,
    color: "#f59e0b",
    marginBottom: 3,
  },
  // Day Card
  dayCard: {
    backgroundColor: "#fdf4ff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#9333ea",
  },
  dayHeader: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#7e22ce",
    marginBottom: 4,
  },
  dayPlan: {
    fontSize: 9,
    color: "#6b7280",
    fontStyle: "italic",
    marginBottom: 8,
  },
  // Activity
  activityBox: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  activityName: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 3,
  },
  activityDetail: {
    fontSize: 8.5,
    color: "#4b5563",
    lineHeight: 1.4,
    marginBottom: 5,
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  metaItem: {
    backgroundColor: "#f3f4f6",
    borderRadius: 6,
    padding: "3 7",
  },
  metaLabel: {
    fontSize: 7.5,
    color: "#9ca3af",
    fontWeight: "bold",
  },
  metaValue: {
    fontSize: 8,
    color: "#374151",
  },
  stopBadge: {
    backgroundColor: "#7c3aed",
    borderRadius: 10,
    padding: "2 7",
    alignSelf: "flex-start",
    marginBottom: 5,
  },
  stopText: {
    color: "#ffffff",
    fontSize: 7.5,
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
  },
  footerText: {
    fontSize: 8,
    color: "#9ca3af",
  },
});

function StarsStr(rating: number) {
  return "★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating)) + ` (${rating})`;
}

export async function POST(req: NextRequest) {
  try {
    const { plan } = await req.json();

    if (!plan) {
      return NextResponse.json({ error: "No plan provided" }, { status: 400 });
    }

    const TripDocument = () => (
      React.createElement(Document, { title: `Trip to ${plan.destination}`, author: "AI Trip Planner" },
        // ─── PAGE 1: Overview + Hotels ───
        React.createElement(Page, { size: "A4", style: styles.page },
          // Header
          React.createElement(View, { style: styles.header },
            React.createElement(Text, { style: styles.headerTitle }, `✈ Trip to ${plan.destination}`),
            React.createElement(Text, { style: styles.headerSub },
              `${plan.origin} → ${plan.destination}  ·  ${plan.duration}${plan.startDate ? `  ·  Starting ${plan.startDate}` : ""}  ·  ${plan.group_size}  ·  ${plan.budget} Budget`
            ),
            plan.weather_note && React.createElement(View, { style: styles.weatherBadge },
              React.createElement(Text, { style: styles.weatherText }, `🌤 ${plan.weather_note}`)
            )
          ),

          // Quick info chips
          React.createElement(View, { style: styles.budgetRow },
            ...[
              `📍 ${plan.destination}`,
              `⏱ ${plan.duration}`,
              `👥 ${plan.group_size}`,
              `💰 ${plan.budget} Budget`,
              ...(plan.startDate ? [`📅 ${plan.startDate}`] : []),
            ].map((label, i) =>
              React.createElement(View, { key: i, style: styles.chip },
                React.createElement(Text, { style: styles.chipText }, label)
              )
            )
          ),

          // Hotels Section
          React.createElement(Text, { style: styles.sectionTitle }, "🏨 Recommended Hotels"),
          ...plan.hotels.map((hotel: any, i: number) =>
            React.createElement(View, { key: i, style: styles.hotelCard },
              React.createElement(Text, { style: styles.hotelName }, hotel.hotel_name),
              React.createElement(Text, { style: styles.stars }, StarsStr(hotel.rating)),
              React.createElement(Text, { style: styles.hotelPrice }, `${hotel.price_per_night} / night`),
              React.createElement(Text, { style: styles.hotelDesc }, hotel.description),
              React.createElement(Text, { style: styles.hotelAddr }, `📍 ${hotel.hotel_address}`)
            )
          ),

          // Footer
          React.createElement(View, { style: styles.footer, fixed: true },
            React.createElement(Text, { style: styles.footerText }, "Generated by AI Trip Planner"),
            React.createElement(Text, { style: styles.footerText }, new Date().toLocaleDateString())
          )
        ),

        // ─── PAGE 2+: Itinerary ───
        React.createElement(Page, { size: "A4", style: styles.page },
          React.createElement(Text, { style: styles.sectionTitle }, "📅 Your Detailed Itinerary"),
          ...plan.itinerary.map((day: any) =>
            React.createElement(View, { key: day.day, style: styles.dayCard },
              React.createElement(Text, { style: styles.dayHeader }, `Day ${day.day} ☀`),
              React.createElement(Text, { style: styles.dayPlan }, day.day_plan),
              ...day.activities.map((act: any, idx: number) =>
                React.createElement(View, { key: idx, style: styles.activityBox },
                  React.createElement(View, { style: styles.stopBadge },
                    React.createElement(Text, { style: styles.stopText }, `Stop ${idx + 1}`)
                  ),
                  React.createElement(Text, { style: styles.activityName }, act.place_name),
                  React.createElement(Text, { style: styles.activityDetail }, act.place_details),
                  React.createElement(View, { style: styles.metaGrid },
                    ...[
                      { label: "📍 Address", val: act.place_address },
                      { label: "🎫 Tickets", val: act.ticket_pricing },
                      { label: "⏰ Best Time", val: act.best_time_to_visit },
                      { label: "🚗 Travel", val: act.time_travel_each_location },
                    ].map(({ label, val }, mi) =>
                      React.createElement(View, { key: mi, style: styles.metaItem },
                        React.createElement(Text, { style: styles.metaLabel }, label),
                        React.createElement(Text, { style: styles.metaValue }, val)
                      )
                    )
                  )
                )
              )
            )
          ),

          // Footer
          React.createElement(View, { style: styles.footer, fixed: true },
            React.createElement(Text, { style: styles.footerText }, "Generated by AI Trip Planner"),
            React.createElement(Text, { style: styles.footerText }, new Date().toLocaleDateString())
          )
        )
      )
    );

    const pdfBuffer = await renderToBuffer(React.createElement(TripDocument));
    const uint8 = new Uint8Array(pdfBuffer);

    return new NextResponse(uint8, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="trip-to-${plan.destination.replace(/\s+/g, "-")}.pdf"`,
        "Content-Length": uint8.byteLength.toString(),
      },
    });
  } catch (error: any) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
