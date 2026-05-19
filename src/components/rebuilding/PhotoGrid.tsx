import Link from "next/link";
import Image from "next/image";
import type { Day } from "@/lib/notion";

interface Props {
  days: Day[];
  total: number;
}

export default function PhotoGrid({ days, total }: Props) {
  const dayMap = new Map<number, Day>();
  for (const d of days) dayMap.set(d.day, d);

  return (
    <div className="rb-photos">
      {Array.from({ length: total }, (_, i) => {
        const dayNum = i + 1;
        const day = dayMap.get(dayNum);
        const photo = day?.photos?.[0];
        const pad = String(dayNum).padStart(2, "0");
        return (
          <Link
            key={dayNum}
            href={`/rebuilding/${pad}`}
            className={`rb-photo ${photo ? "rb-photo-has" : ""}`}
            prefetch={false}
          >
            {photo && (
              <Image
                src={photo}
                alt={`day ${pad}`}
                fill
                sizes="(max-width: 640px) 10vw, 100px"
                style={{ objectFit: "cover" }}
              />
            )}
            <span className="rb-photo-label">{pad}</span>
          </Link>
        );
      })}
    </div>
  );
}
