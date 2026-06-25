"use client";

import { useState } from "react";

interface Props {
  catId: string;
  catName: string;
}

export function QRCode({ catId, catName }: Props) {
  const [show, setShow] = useState(false);
  const profileUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/cat/${catId}`;
  
  // Use a public QR code API for generation (no server dependency needed)
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(profileUrl)}`;

  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="text-sm text-indigo-600 hover:text-indigo-800 underline"
      >
        Show QR Code
      </button>
    );
  }

  return (
    <div className="mt-3 p-3 bg-white rounded-lg border text-center">
      <img
        src={qrUrl}
        alt={`QR code for ${catName}`}
        width={200}
        height={200}
        className="mx-auto"
      />
      <p className="mt-2 text-xs text-gray-500">
        Print this and attach to {catName}&apos;s collar
      </p>
      <a
        href={qrUrl}
        download={`pawport-${catName.toLowerCase()}-qr.png`}
        className="mt-2 inline-block text-sm text-indigo-600 hover:text-indigo-800 underline"
      >
        Download QR Image
      </a>
      <button
        onClick={() => setShow(false)}
        className="mt-2 block mx-auto text-xs text-gray-400 hover:text-gray-600"
      >
        Hide
      </button>
    </div>
  );
}
