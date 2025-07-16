import { createContext, ReactNode, useState } from "react";
import { Draft, Reactions, UserReactions } from "../../types";

interface InteractionContextType {
  reactions: Reactions;
  setReactions: React.Dispatch<React.SetStateAction<Reactions>>;
  userReactions: UserReactions;
  setUserReactions: React.Dispatch<React.SetStateAction<UserReactions>>;
  isBookmarked: boolean;
  setIsBookmarked: React.Dispatch<React.SetStateAction<boolean>>;
  newComment: string;
  setNewComment: React.Dispatch<React.SetStateAction<string>>;
  drafts: Draft[];
  setDrafts: React.Dispatch<React.SetStateAction<Draft[]>>;
}

const InteractionContext = createContext<InteractionContextType | undefined>(undefined);

function UserInteractionProvider({ children }: { children: ReactNode }) {
  const [reactions, setReactions] = useState<Reactions>({ likes: 0, applause: 0, laugh: 0 });
  const [userReactions, setUserReactions] = useState<UserReactions>({ likes: false, applause: false, laugh: false });
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [drafts, setDrafts] = useState<Draft[]>([]);
  

  return (
    <InteractionContext.Provider
      value={{
        reactions,
        setReactions,
        userReactions,
        setUserReactions,
        isBookmarked,
        setIsBookmarked,
        newComment,
        setNewComment,
        drafts,
        setDrafts
      }}
    >
      {children}
    </InteractionContext.Provider>
  );
}

export { InteractionContext, UserInteractionProvider };
