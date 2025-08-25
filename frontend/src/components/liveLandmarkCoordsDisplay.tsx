"use client";

import React, { useEffect, useState } from "react";
import { CoordRow, SingleLandmarkData } from "@/types/index"

export default function LiveCoordinates({ coordinates, label = "data" }: SingleLandmarkData) {
  const [rows, setRows] = useState<CoordRow[]>([]);

  // Add new row on coordinate update
  useEffect(() => {
    if (!coordinates || coordinates.length === 0) return;
  // Print raw coordinates
  console.log("Raw coordinates:", coordinates);

    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:` +
                 `${now.getMinutes().toString().padStart(2, "0")}:` +
                 `${now.getSeconds().toString().padStart(2, "0")}:` +
                 `${now.getMilliseconds().toString().padStart(3, "0")}`;

    const newRows = coordinates.map(([x, y, z]) => ({ time, x, y, z }));

    setRows(prev => {
      const combined = [...prev, ...newRows];
      return combined.slice(-8); // keep last 8 rows
    });
  }, [coordinates]);

  return (
    <div className="bg-black text-white p-2 rounded w-78 font-mono text-xs">
      <div className="font-bold mb-1">{label}</div>
      <div className="grid grid-cols-[120px_50px_50px_50px] gap-x-1 border-b border-white pb-1 mb-1">
        <span>Time</span>
				<span className="text-center">X</span>
				<span className="text-center">Y</span>
				<span className="text-center">Z</span>
      </div>
      {rows.map((row, idx) => (
        <div key={idx} className="grid grid-cols-[120px_50px_50px_50px] gap-x-1">
          <span>{row.time}</span>
          <span className="text-right">{row.x.toFixed(3)}</span>
          <span className="text-right">{row.y.toFixed(3)}</span>
        	<span className="text-right">{row.z.toFixed(3)}</span>
        </div>
      ))}
    </div>
  );
}