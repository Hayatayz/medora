/**
 * Centralized pdf.js initializer.
 *
 * pdfjs-dist 5.x uses Map.prototype.getOrInsertComputed() which is not
 * available in all browsers. The *legacy* build ships a polyfill for it.
 * We therefore import from "pdfjs-dist/legacy/build/pdf.mjs" and point
 * the worker at the matching legacy worker on jsDelivr.
 */

let initialized = false;

export async function getPdfjsLib() {
  // Dynamic import so this only runs on the client
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

  if (!initialized) {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/legacy/build/pdf.worker.min.mjs`;
    initialized = true;
  }

  return pdfjsLib;
}
