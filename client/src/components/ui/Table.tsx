import React from "react";

type Props = { headers: string[]; rows: React.ReactNode; mobileCard?: React.ReactNode };

export function Table({ headers, rows, mobileCard }: Props) {
  return (
    <>
      <div className="hidden sm:block overflow-x-auto rounded-2xl border border-white/50 bg-white/70">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-slate-50/90 backdrop-blur">
            <tr>
              {headers.map((h) => (
                <th key={h} className="px-4 py-3 text-left font-semibold text-slate-700">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white/70">{rows}</tbody>
        </table>
      </div>
      <div className="sm:hidden">{mobileCard || <div className="overflow-x-auto rounded-2xl border border-white/50 bg-white/70"><table className="min-w-[560px] text-sm"><thead className="bg-slate-50/90"><tr>{headers.map((h) => <th key={h} className="px-3 py-2 text-left">{h}</th>)}</tr></thead><tbody>{rows}</tbody></table></div>}</div>
    </>
  );
}
