"use client";

import { useState } from "react";
import { QrCode } from "lucide-react";

interface Props {
  catId: string;
  catName: string;
}

export function QRCode({ catId, catName }: Props) {
  const [show, setShow] = useState(false);
  const profileUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/cat/${catId}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(profileUrl)}`;

  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="flex items-center gap-1.5 text-[13px] font-body font-medium text-[#E07A5F] hover:underline transition-colors duration-200"
      >
        <QrCode size={14} />
        Show QR Code
      </button>
    );
  }

  return (
    <div className="p-4 bg-white rounded-[10px] border border-[#F0E6DF] text-center">
      <img src={qrUrl} alt={`QR code for ${catName}`} width={180} height={180} className="mx-auto" />
      <p className="mt-2 text-[11px] text-[#6B5B52] font-body">Print this and attach to {catName}&apos;s collar</p>
      <a href={qrUrl} download={`pawport-${catName.toLowerCase()}-qr.png`} className="mt-2 inline-block text-[13px] text-[#E07A5F] font-body font-medium hover:underline">
        Download QR Image
      </a>
      <button onClick={() => setShow(false)} className="block mx-auto mt-2 text-[11px] text-[#6B5B52] hover:text-[#2C1810] font-body transition-colors duration-200">
        Hide
      </button>
    </div>
  );
}
