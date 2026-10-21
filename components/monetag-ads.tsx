"use client";

import { useEffect } from "react";

const ONCLICK_HOST = "5gvci.com";
const ONCLICK_ZONE_ID = 12091078;

export function MonetagAds() {
  useEffect(() => {
    const src = `https://${ONCLICK_HOST}/ntfc.php?p=${ONCLICK_ZONE_ID}`;
    if (document.querySelector(`script[src="${src}"]`)) return;
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    (document.head || document.body).appendChild(script);
  }, []);

  return null;
}
