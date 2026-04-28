import TreeNode from './TreeNode';

const FamilyTree = ({ person }) => {
  return (
    <div className="family-tree-container p-4">
      <div className="flex flex-col items-center">
        <TreeNode person={person} />
      </div>
    </div>
  );
};

export default FamilyTree;
