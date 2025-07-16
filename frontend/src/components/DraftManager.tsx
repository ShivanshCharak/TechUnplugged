import { useState } from "react";
import { DraftManagerProps } from "../types";
import { Edit3, X } from "lucide-react";

export const DraftManager: React.FC<DraftManagerProps> = ({ drafts, onLoadDraft, onDeleteDraft }) => {
  const [showDrafts, setShowDrafts] = useState(false);

  return (
    <div className="mb-4">
      <button
        onClick={() => setShowDrafts(!showDrafts)}
        className="flex items-center space-x-2 text-sm text-gray-400 hover:text-gray-300"
      >
        <Edit3 size={16} />
        <span>Drafts ({drafts.length})</span>
      </button>
      
      {showDrafts && (
        <div className="mt-2 bg-gray-800 rounded-lg p-3 border border-gray-700">
          {drafts.length === 0 ? (
            <p className="text-gray-400 text-sm">No drafts saved</p>
          ) : (
            <div className="space-y-2">
              {drafts.map((draft) => (
                <div key={draft.id} className="flex items-center justify-between bg-gray-700 p-2 rounded">
                  <div className="flex-1">
                    <p className="text-sm text-white truncate">{draft.content.substring(0, 50)}...</p>
                    <p className="text-xs text-gray-400">
                      {new Date(draft.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => onLoadDraft(draft)}
                      className="text-blue-400 hover:text-blue-300 p-1"
                      title="Load draft"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => onDeleteDraft(draft.id)}
                      className="text-red-400 hover:text-red-300 p-1"
                      title="Delete draft"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};