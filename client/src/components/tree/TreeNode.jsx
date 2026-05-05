import { useState } from 'react';
import PersonCard from './PersonCard';
import { ChevronDown, ChevronUp } from 'lucide-react';

const TreeNode = ({ person }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (person.isAlreadyRendered) {
    return (
      <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
        <div className="px-6 py-4 bg-white/50 backdrop-blur-sm border border-dashed border-slate-200 rounded-3xl text-slate-400 text-xs font-bold italic shadow-sm hover:shadow-md transition-shadow">
          See {person.firstName} {person.lastName} above
        </div>
      </div>
    );
  }

  const hasChildren = person.unions?.some(u => u.children?.length > 0);

  return (
    <div className="tree-node flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700">

      {/* ── Partner Row ─────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <PersonCard person={person} />

        {person.unions?.map((union) => (
          <div key={union.id} className="flex items-center">
            {/* Connector between partners */}
            <div className="w-16 flex items-center justify-center relative">
              <div className="w-full h-[3px] bg-slate-200 rounded-full" />
              <div className="absolute w-5 h-5 rounded-full bg-white border-[3px] border-slate-200 shadow-sm flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,0.5)]" />
              </div>
            </div>

            {/* Partner Card */}
            {union.partner ? (
              <PersonCard person={union.partner} />
            ) : (
              <div className="w-[300px] p-8 bg-slate-50/50 border-2 border-dashed border-slate-200/50 rounded-[2.5rem] flex items-center justify-center text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] italic">
                Unknown Partner
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Children Sections (one per union, in normal flow) ── */}
      {!isCollapsed && person.unions?.map((union) => {
        if (!union.children?.length) return null;

        return (
          <div key={`children-${union.id}`} className="flex flex-col items-center mt-0">
            {/* Vertical stem from partner row to horizontal bar */}
            <div className="w-[3px] h-16 bg-slate-200 rounded-b-full" />

            {/* Children row */}
            <div className="flex gap-20 relative">
              {union.children.map((child, index, array) => {
                const isFirst = index === 0;
                const isLast = index === array.length - 1;

                return (
                  <div key={child.id} className="flex flex-col items-center relative">
                    {/* Horizontal bar segment */}
                    {array.length > 1 && (
                      <div
                        className={`absolute top-0 h-[3px] bg-slate-200
                          ${isFirst ? 'left-1/2 right-0 rounded-l-full' : isLast ? 'left-0 right-1/2 rounded-r-full' : 'left-0 right-0'}`}
                      />
                    )}
                    {/* Vertical drop to child */}
                    <div className="w-[3px] h-16 bg-slate-200 rounded-t-full" />
                    <TreeNode person={child} />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* ── Collapse Toggle ─────────────────────────────────── */}
      {hasChildren && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="mt-6 mb-12 z-30 bg-white border border-slate-200 rounded-2xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 shadow-xl shadow-slate-200/40 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          {isCollapsed ? (
            <>
              <ChevronDown className="w-4 h-4" />
              Show Descendants
            </>
          ) : (
            <>
              <ChevronUp className="w-4 h-4" />
              Hide Descendants
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default TreeNode;
