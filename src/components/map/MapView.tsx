import { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Place, RouteInfo } from '@/types';

interface MapViewProps {
  places: Place[];
  selectedPlace?: Place | null;
  onPlaceSelect?: (place: Place) => void;
  onGetDirections?: (place: Place) => void;
  route?: RouteInfo | null;
  center?: [number, number];
  zoom?: number;
}

const defaultMarkerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const selectedMarkerIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="background: linear-gradient(135deg, hsl(200, 85%, 45%), hsl(220, 75%, 55%)); width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3);"></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

function buildPopupHtml(place: Place) {
  const safeTitle = escapeHtml(place.name);
  const safeDesc = escapeHtml(place.description);
  const img = place.imageUrl || '/placeholder.svg';

  return `
    <div style="min-width: 220px; max-width: 260px; padding: 8px;">
      <img src="${img}" alt="${safeTitle}" style="width: 100%; height: 96px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />
      <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">${safeTitle}</div>
      <div style="font-size: 12px; opacity: 0.75; margin-bottom: 10px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${safeDesc}</div>
      <div style="display: flex; gap: 8px; align-items: center;">
        <button id="dir-${place.id}" style="flex: 1; height: 28px; border: 1px solid rgba(0,0,0,0.15); border-radius: 8px; background: rgba(0,0,0,0.04); cursor: pointer; font-size: 12px;">Directions</button>
        <a href="https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}" target="_blank" rel="noreferrer" style="height: 28px; padding: 0 10px; display: inline-flex; align-items: center; justify-content: center; border: 1px solid rgba(0,0,0,0.15); border-radius: 8px; text-decoration: none; font-size: 12px;">Open</a>
      </div>
    </div>
  `;
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function MapView({
  places,
  selectedPlace,
  onPlaceSelect,
  onGetDirections,
  route,
  center = [20.5937, 78.9629],
  zoom = 5,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);

  const hasPlaces = places.length > 0;

  // init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center,
      zoom,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);

    mapRef.current = map;
    markersLayerRef.current = markersLayer;

    return () => {
      map.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
      routeLayerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // update center/zoom when empty
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!hasPlaces) {
      map.setView(center, zoom);
    }
  }, [center, zoom, hasPlaces]);

  // update markers + bounds
  useEffect(() => {
    const map = mapRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    for (const place of places) {
      const marker = L.marker([place.latitude, place.longitude], {
        icon: selectedPlace?.id === place.id ? selectedMarkerIcon : defaultMarkerIcon,
      });

      marker.on('click', () => {
        onPlaceSelect?.(place);
      });

      marker.bindPopup(buildPopupHtml(place), { closeButton: true });

      marker.on('popupopen', () => {
        // Attach button click handler after popup DOM is created
        const btn = document.getElementById(`dir-${place.id}`);
        if (btn) {
          const handler = () => onGetDirections?.(place);
          btn.addEventListener('click', handler, { once: true });
        }
      });

      marker.addTo(markersLayer);
    }

    if (places.length > 0) {
      const bounds = L.latLngBounds(places.map((p) => [p.latitude, p.longitude] as [number, number]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [places, selectedPlace?.id, onPlaceSelect, onGetDirections]);

  // update route polyline
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }

    if (route && route.geometry?.length) {
      const polyline = L.polyline(route.geometry, {
        color: 'hsl(200, 85%, 45%)',
        weight: 5,
        opacity: 0.85,
      }).addTo(map);

      routeLayerRef.current = polyline;
    }
  }, [route]);

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-border shadow-md">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
