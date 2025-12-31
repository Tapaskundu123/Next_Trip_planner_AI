"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface RouteMapProps {
    origin: string;
    destination: string;
}

const RouteMap: React.FC<RouteMapProps> = ({ origin, destination }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<maplibregl.Map | null>(null);

    useEffect(() => {
        if (!mapRef.current) return;

        const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;

        if (!MAPTILER_KEY) {
            console.error("NEXT_PUBLIC_MAPTILER_KEY is not defined");
            return;
        }

        // Initialize map
        const map = new maplibregl.Map({
            container: mapRef.current,
            style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`,
            center: [78.9629, 20.5937], // India center
            zoom: 4,
        });

        mapInstance.current = map;

        map.on("load", async () => {
            try {
                // Geocode origin and destination using MapTiler Geocoding API
                const geocodeUrl = (query: string) =>
                    `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${MAPTILER_KEY}`;

                const [originRes, destRes] = await Promise.all([
                    fetch(geocodeUrl(origin)).then((r) => r.json()),
                    fetch(geocodeUrl(destination)).then((r) => r.json()),
                ]);

                const originCoords = originRes.features?.[0]?.geometry?.coordinates;
                const destCoords = destRes.features?.[0]?.geometry?.coordinates;

                if (!originCoords || !destCoords) {
                    console.error("Could not geocode locations");
                    return;
                }

                // Add markers
                new maplibregl.Marker({ color: "#10B981" }) // Green for origin
                    .setLngLat(originCoords)
                    .setPopup(new maplibregl.Popup().setHTML(`<strong>Origin:</strong> ${origin}`))
                    .addTo(map);

                new maplibregl.Marker({ color: "#EF4444" }) // Red for destination
                    .setLngLat(destCoords)
                    .setPopup(new maplibregl.Popup().setHTML(`<strong>Destination:</strong> ${destination}`))
                    .addTo(map);

                // Draw red route line
                map.addSource("route", {
                    type: "geojson",
                    data: {
                        type: "Feature",
                        properties: {},
                        geometry: {
                            type: "LineString",
                            coordinates: [originCoords, destCoords],
                        },
                    },
                });

                map.addLayer({
                    id: "route",
                    type: "line",
                    source: "route",
                    layout: {
                        "line-join": "round",
                        "line-cap": "round",
                    },
                    paint: {
                        "line-color": "#EF4444", // Red
                        "line-width": 4,
                        "line-opacity": 0.8,
                    },
                });

                // Fit bounds to show both points
                const bounds = new maplibregl.LngLatBounds(originCoords, destCoords);
                map.fitBounds(bounds, { padding: 100 });
            } catch (error) {
                console.error("Error loading route:", error);
            }
        });

        return () => {
            map.remove();
        };
    }, [origin, destination]);

    return (
        <div className="w-full h-96 md:h-[500px] rounded-2xl overflow-hidden shadow-xl border-4 border-gray-200">
            <div ref={mapRef} className="w-full h-full" />
        </div>
    );
};

export default RouteMap;
