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
      <div className="flex items-center gap-12 mb-8 relative">
        <PersonCard person={person} />

        {person.unions?.map((union) => (
          <Fragment key={union.id}>
            {/* Connector between partners */}
            <div className="absolute left-[140px] top-1/2 -translate-y-1/2 w-12 h-0.5 bg-gray-300 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-gray-300"></div>
            </div>
            
            {/* Partner Card */}
            <div className="relative">
              {union.partner ? (
                <PersonCard person={union.partner} />
              ) : (
                <div className="w-[280px] p-4 bg-gray-50 border border-dashed border-gray-200 rounded-2xl flex items-center justify-center text-gray-400 text-sm font-medium italic">
                  Unknown Partner
                </div>
              )}
              
              {/* Vertical line from union to children */}
              {union.children?.length > 0 && !isCollapsed && (
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-gray-300"></div>
              )}
            </div>
          </Fragment>
        ))}
      </div>

      {/* Collapse Toggle */}
      {hasChildren && (
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute bottom-4 z-10 bg-white border border-gray-200 rounded-full p-1 text-gray-400 hover:text-indigo-600 shadow-sm transition-all"
        >
          {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      )}

      {/* Children Row */}
      {!isCollapsed && person.unions?.some(u => u.children?.length > 0) && (
        <div className="children-container flex gap-12 pt-8 border-t-2 border-gray-200 relative">
          {/* Connector from above */}
          <div className="absolute -top-[2px] left-1/2 -translate-x-1/2 w-0.5 h-2 bg-gray-200"></div>
          
          {person.unions.flatMap(u => u.children).map((child) => (
            <div key={child.id} className="relative">
              {/* Connector line on the children row */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-gray-200"></div>
              <TreeNode person={child} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeNode;
