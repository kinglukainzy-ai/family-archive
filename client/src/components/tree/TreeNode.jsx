import { useState } from 'react';
import PersonCard from './PersonCard';
import { ChevronDown, ChevronUp } from 'lucide-react';

const TreeNode = ({ person }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (person.isAlreadyRendered) {
    return (
      <div className="flex flex-col items-center">
        <div className="p-4 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-gray-400 text-xs italic">
          See {person.firstName} {person.lastName} above
        </div>
      </div>
    );
  }

  const hasChildren = person.unions?.some(u => u.children?.length > 0);

  return (
    <div className="tree-node flex flex-col items-center">

      {/* ── Partner Row ─────────────────────────────────────── */}
      <div className="flex items-center">
        <PersonCard person={person} />

        {person.unions?.map((union) => (
          <div key={union.id} className="flex items-center">
            {/* Connector between partners */}
            <div className="w-12 flex items-center justify-center relative">
              <div className="w-full h-0.5 bg-slate-200" />
              <div className="absolute w-3 h-3 rounded-full bg-slate-200 border-2 border-white shadow-sm" />
            </div>

            {/* Partner Card */}
            {union.partner ? (
              <PersonCard person={union.partner} />
            ) : (
              <div className="w-[280px] p-6 bg-slate-50 border-2 border-dashed border-slate-100 rounded-[2rem] flex items-center justify-center text-slate-400 text-sm font-black uppercase tracking-widest italic">
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
          <div key={`children-${union.id}`} className="flex flex-col items-center">
            {/* Vertical stem from partner row to horizontal bar */}
            <div className="w-0.5 h-12 bg-slate-200" />

            {/* Children row */}
            <div className="flex gap-16 relative">
              {union.children.map((child, index, array) => {
                const isFirst = index === 0;
                const isLast = index === array.length - 1;

                return (
                  <div key={child.id} className="flex flex-col items-center relative">
                    {/* Horizontal bar segment */}
                    {array.length > 1 && (
                      <div
                        className={`absolute top-0 h-0.5 bg-slate-200
                          ${isFirst ? 'left-1/2 right-0' : isLast ? 'left-0 right-1/2' : 'left-0 right-0'}`}
                      />
                    )}
                    {/* Vertical drop to child */}
                    <div className="w-0.5 h-12 bg-slate-200" />
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
          className="mt-2 mb-6 z-30 bg-white border-2 border-slate-100 rounded-full p-1.5 text-slate-400 hover:text-primary-600 hover:border-primary-100 shadow-xl shadow-slate-200/50 transition-all transform hover:scale-110 active:scale-95"
        >
          {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        </button>
      )}
    </div>
  );
};

export default TreeNode;
