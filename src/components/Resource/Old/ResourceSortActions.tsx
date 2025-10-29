import React from "react";
import { MdArrowDownward, MdArrowUpward } from "react-icons/md";

interface ResourceSortActionsProps {
  resourceId: string;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  disabled?: boolean;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}

export const ResourceSortActions: React.FC<ResourceSortActionsProps> = ({
  resourceId,
  onMoveUp,
  onMoveDown,
  disabled = false,
  canMoveUp = true,
  canMoveDown = true,
}) => {
  const handleMoveUp = () => {
    if (onMoveUp) {
      onMoveUp(resourceId);
    }
  };

  const handleMoveDown = () => {
    if (onMoveDown) {
      onMoveDown(resourceId);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {canMoveUp && (
        <button
          onClick={handleMoveUp}
          disabled={disabled}
          className="h-8 w-8 p-1 flex items-center justify-center rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="上移一位"
        >
          <MdArrowUpward className="h-4 w-4" />
        </button>
      )}
      {canMoveDown && (
        <button
          onClick={handleMoveDown}
          disabled={disabled}
          className="h-8 w-8 p-1 flex items-center justify-center rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="下移一位"
        >
          <MdArrowDownward className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
