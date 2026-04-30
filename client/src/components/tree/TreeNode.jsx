import { useState, Fragment } from 'react';
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
    <div className="tree-node flex flex-col items-center relative">
      {/* Current Person & Spouse(s) */}
      <div className="flex items-center gap-12 mb-4 relative">
        <PersonCard person={person} />

        {person.unions?.map((union) => (
          <div key={union.id} className="flex items-center gap-12">
            {/* Connector between partners */}
            <div className="flex flex-col items-center justify-center w-12 relative">
              <div className="w-full h-0.5 bg-slate-200 flex items-center justify-center relative">
                <div className="absolute w-3 h-3 rounded-full bg-slate-200 border-2 border-white shadow-sm"></div>
              </div>
              
              {/* Vertical line from union to children group */}
              {union.children?.length > 0 && !isCollapsed && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-0.5 h-[52px] bg-slate-200"></div>
              )}

              {/* Children Group for THIS Union */}
              {union.children?.length > 0 && !isCollapsed && (
                <div className="absolute top-[52px] left-1/2 -translate-x-1/2">
                   <div className="children-container flex gap-16 relative pt-12">
                    {union.children.map((child, index, array) => {
                      const isFirst = index === 0;
                      const isLast = index === array.length - 1;
                      
                      return (
                        <div key={child.id} className="relative">
                          {/* Horizontal line logic */}
                          {array.length > 1 && (
                            <div className={`absolute top-0 h-0.5 bg-slate-200
                              ${isFirst ? 'left-1/2 right-0' : isLast ? 'left-0 right-1/2' : 'left-0 right-0'}`}
                            ></div>
                          )}
                          
                          {/* Vertical line to child */}
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-12 bg-slate-200"></div>
                          
                          <TreeNode person={child} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            
            {/* Partner Card */}
            <div className="relative">
              {union.partner ? (
                <PersonCard person={union.partner} />
              ) : (
                <div className="w-[280px] p-6 bg-slate-50 border-2 border-dashed border-slate-100 rounded-[2rem] flex items-center justify-center text-slate-400 text-sm font-black uppercase tracking-widest italic">
                  Unknown Partner
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Collapse Toggle */}
      {hasChildren && (
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="mb-10 z-30 bg-white border-2 border-slate-100 rounded-full p-1.5 text-slate-400 hover:text-primary-600 hover:border-primary-100 shadow-xl shadow-slate-200/50 transition-all transform hover:scale-110 active:scale-95"
        >
          {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        </button>
      )}
    </div>
  );
};

export default TreeNode;
