import TreeNode from './TreeNode';

const FamilyTree = ({ person }) => {
  return (
    <div className="overflow-auto w-full pb-20">
      <div className="flex justify-center min-w-max px-8 pb-20">
        <TreeNode person={person} />
      </div>
    </div>
  );
};

export default FamilyTree;
