import { comment } from "../types";

export const flattenComments = (nestedComments: any[]): comment[] => {
  const flattened: comment[] = [];
  
  const processComment = (comment: any, parentId: string | null = null) => {
    
    const flatComment: comment = {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      user: comment.user,
      userId: comment.userId,
      blogId: comment.blogId || '', 
      replyToId: parentId
    };
    
    flattened.push(flatComment);
    
    
    if (comment.replies && comment.replies.length > 0) {
      comment.replies.forEach((reply: any) => {
        processComment(reply, comment.id);
      });
    }
  };
  
  nestedComments.forEach(comment => processComment(comment));
  return flattened;
};