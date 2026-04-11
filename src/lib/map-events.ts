/** Leaflet térkép újraméretezése (pl. modál bezárása után). */
export const VRS_MAP_INVALIDATE_EVENT = "vrs-map-invalidate";

export function requestMapInvalidate() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(VRS_MAP_INVALIDATE_EVENT));
}
