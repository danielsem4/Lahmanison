import type { Response } from 'express';

// Files are served from the app's own origin, so rendering them inline with a
// user-controlled mime type is a stored-XSS vector (e.g. an uploaded text/html
// or image/svg+xml file could run scripts against the session cookie). Only
// allow inline rendering for types that browsers treat as inert documents/media.
export function canRenderInline(mimeType: string): boolean {
  return (
    mimeType === 'application/pdf' ||
    mimeType === 'text/plain' ||
    (mimeType.startsWith('image/') && mimeType !== 'image/svg+xml')
  );
}

// Streams a stored file to the client with safe download/inline headers.
// `wantsInline` honours a `?disposition=inline` request, but only for types the
// allowlist above considers safe to render in the browser.
export function sendFileResponse(
  res: Response,
  file: { fileName: string; mimeType: string },
  buffer: Buffer,
  wantsInline: boolean,
): void {
  const encoded = encodeURIComponent(file.fileName);
  const disposition = wantsInline && canRenderInline(file.mimeType) ? 'inline' : 'attachment';
  res.setHeader('Content-Type', file.mimeType);
  // Never let the browser sniff a different (executable) type than declared.
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (disposition === 'inline') {
    // Sandbox inline content so it cannot run scripts or reach the session.
    res.setHeader('Content-Security-Policy', 'sandbox');
  }
  res.setHeader(
    'Content-Disposition',
    `${disposition}; filename="${encoded}"; filename*=UTF-8''${encoded}`,
  );
  res.send(buffer);
}
