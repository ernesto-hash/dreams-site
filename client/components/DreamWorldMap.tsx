import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { useState } from "react";

const countryCoordinates: Record<string, [number, number]> = {
  "Angola":         [17.8739, -11.2027],
  "Portugal":       [-8.2245,  39.3999],
  "Brazil":         [-51.9253, -14.2350],
  "United States":  [-95.7129,  37.0902],
  "United Kingdom": [-3.4360,   55.3781],
  "Germany":        [10.4515,   51.1657],
  "France":         [2.2137,    46.2276],
  "Spain":          [-3.7492,   40.4637],
  "Japan":          [138.2529,  36.2048],
  "Italy":          [12.5674,   41.8719],
  "Canada":         [-96.8165,  56.1304],
  "Australia":      [133.7751, -25.2744],
  "Mexico":         [-102.5528, 23.6345],
  "Argentina":      [-63.6167, -38.4161],
  "Nigeria":        [8.6753,    9.0820],
  "South Africa":   [22.9375,  -30.5595],
  "India":          [78.9629,   20.5937],
  "China":          [104.1954,  35.8617],
  "South Korea":    [127.7669,  35.9078],
  "Netherlands":    [5.2913,    52.1326],
  "Sweden":         [18.6435,   60.1282],
  "Poland":         [19.1451,   51.9194],
  "Turkey":         [35.2433,   38.9637],
  "Morocco":        [-7.0926,   31.7917],
  "Egypt":          [30.8025,   26.8206],
  "Colombia":       [-74.2973,   4.5709],
  "Chile":          [-71.5430,  -35.6751],
  "Peru":           [-75.0152,  -9.1900],
};

type Dream = {
  id: string;
  country?: string | null;
  title?: string | null;
  description?: string | null;
};

export default function DreamWorldMap({ dreams }: { dreams: Dream[] }) {
  const [tooltip, setTooltip] = useState("");

  const markers = dreams
    .filter(d => d.country && countryCoordinates[d.country])
    .map(d => ({
      id: d.id,
      coordinates: countryCoordinates[d.country!] as [number, number],
      title: d.title || d.description?.substring(0, 40) || "Dream",
      country: d.country!,
    }));

  return (
    <div className="w-full bg-slate-900/60 rounded-xl p-4 border border-neon-primary/20">
      <h2 className="text-center text-yellow-400 font-orbitron font-bold text-xl mb-4">
        Dreams Around The World
      </h2>
      <ComposableMap projectionConfig={{ scale: 147 }}>
        <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json">
          {({ geographies }) =>
            geographies.map(geo => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#1A1A2E"
                stroke="#D4A017"
                strokeWidth={0.3}
                style={{
                  default: { outline: "none" },
                  hover:   { fill: "#2a2a4e", outline: "none" },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>
        {markers.map(marker => (
          <Marker
            key={marker.id}
            coordinates={marker.coordinates}
            onMouseEnter={() => setTooltip(`${marker.country}: ${marker.title}`)}
            onMouseLeave={() => setTooltip("")}
          >
            <circle
              r={5}
              fill="#D4A017"
              opacity={0.85}
              style={{ cursor: "pointer" }}
            />
          </Marker>
        ))}
      </ComposableMap>
      {tooltip && (
        <p className="text-center text-yellow-400 text-sm mt-2 truncate px-4">{tooltip}</p>
      )}
      {markers.length === 0 && (
        <p className="text-center text-neon-secondary/50 text-sm -mt-4 pb-2">
          Dreams will appear on the map as they are submitted
        </p>
      )}
    </div>
  );
}
