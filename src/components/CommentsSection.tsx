import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Reply, 
  Send, 
  CornerDownRight, 
  Sparkles,
  Clock
} from 'lucide-react';
import { PostComment, UserProfile } from '../types';
import { 
  apiGetComments, 
  apiCreateComment, 
  apiToggleLikeComment, 
  getActiveUser, 
  subscribeToLocalChannel 
} from '../lib/supabase';

interface CommentsSectionProps {
  postId: string;
  onCommentsCountChange?: (newCount: number) => void;
  onSelectUserForChat?: (user: UserProfile) => void;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({ 
  postId,
  onCommentsCountChange,
  onSelectUserForChat
}) => {
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [replyingToComment, setReplyingToComment] = useState<PostComment | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const currentUser = getActiveUser();

  const loadComments = async () => {
    setLoading(true);
    try {
      const fetched = await apiGetComments(postId);
      setComments(fetched);
      if (onCommentsCountChange) {
        onCommentsCountChange(fetched.length);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();

    // Listen to real-time new comments for this post
    const unsubComments = subscribeToLocalChannel(`post_comments_${postId}`, (newComment: PostComment) => {
      setComments(prev => {
        if (prev.some(c => c.id === newComment.id)) return prev;
        const updated = [...prev, newComment];
        if (onCommentsCountChange) onCommentsCountChange(updated.length);
        return updated;
      });
    });

    return () => {
      unsubComments();
    };
  }, [postId]);

  const handlePostComment = async (e: React.FormEvent, parentId?: string | null) => {
    e.preventDefault();
    if (!newCommentText.trim() || submitting) return;

    setSubmitting(true);
    try {
      const created = await apiCreateComment(postId, newCommentText.trim(), parentId || null);
      setComments(prev => {
        if (prev.some(c => c.id === created.id)) return prev;
        const updated = [...prev, created];
        if (onCommentsCountChange) onCommentsCountChange(updated.length);
        return updated;
      });
      setNewCommentText('');
      setReplyingToComment(null);
    } catch (err) {
      console.error('Error posting comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      const updated = await apiToggleLikeComment(commentId);
      setComments(prev => prev.map(c => c.id === commentId ? updated : c));
    } catch (err) {
      console.error('Error toggling comment like:', err);
    }
  };

  const handleStartReply = (comment: PostComment) => {
    setReplyingToComment(comment);
    setNewCommentText(`@${comment.author.username} `);
  };

  // Organize comments into nested tree
  const buildCommentTree = (items: PostComment[]): PostComment[] => {
    const itemMap = new Map<string, PostComment>();
    const roots: PostComment[] = [];

    items.forEach(item => {
      itemMap.set(item.id, { ...item, replies: [] });
    });

    items.forEach(item => {
      const mapped = itemMap.get(item.id)!;
      if (item.parent_id && itemMap.has(item.parent_id)) {
        const parent = itemMap.get(item.parent_id)!;
        if (!parent.replies) parent.replies = [];
        parent.replies.push(mapped);
      } else {
        roots.push(mapped);
      }
    });

    return roots;
  };

  const commentTree = buildCommentTree(comments);

  const renderCommentContent = (text: string) => {
    const parts = text.split(/(@[a-zA-Z0-9_]+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        return (
          <span 
            key={i} 
            className="inline-flex items-center px-1.5 py-0.2 rounded bg-[#3B6FF0]/15 text-[#3B6FF0] font-semibold text-xs border border-[#3B6FF0]/30"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const formatTimeAgo = (isoDate: string) => {
    const diff = Date.now() - new Date(isoDate).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 1) return 'ahora';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  const CommentNode: React.FC<{ comment: PostComment; isChild?: boolean }> = ({ comment, isChild = false }) => {
    return (
      <div className={`space-y-2 ${isChild ? 'ml-4 sm:ml-6 pl-3 border-l-2 border-white/10' : ''}`}>
        <div className="p-3 rounded-xl bg-[#0A0E14] border border-white/5 hover:border-white/20 transition-all space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img
                src={comment.author.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${comment.author.username}`}
                alt={comment.author.display_name}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-white/10"
              />
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-semibold text-xs text-slate-200">
                    {comment.author.display_name}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    @{comment.author.username}
                  </span>
                </div>
                <span className="text-[9px] text-slate-500 flex items-center space-x-1">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{formatTimeAgo(comment.created_at)}</span>
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 text-xs">
              <button
                onClick={() => handleLikeComment(comment.id)}
                className={`flex items-center space-x-1 px-2 py-0.5 rounded-lg transition-all text-[11px] ${
                  comment.is_liked
                    ? 'bg-[#3B6FF0]/15 text-[#3B6FF0] border border-[#3B6FF0]/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Heart className={`w-3 h-3 ${comment.is_liked ? 'fill-[#3B6FF0] text-[#3B6FF0]' : ''}`} />
                <span>{comment.likes_count || 0}</span>
              </button>

              <button
                onClick={() => handleStartReply(comment)}
                className="flex items-center space-x-1 text-[11px] text-slate-400 hover:text-white transition-colors px-2 py-0.5 rounded-lg hover:bg-white/5"
              >
                <Reply className="w-3 h-3 text-slate-400" />
                <span>Responder</span>
              </button>
            </div>
          </div>

          {/* Comment text */}
          <p className="text-xs text-slate-200 leading-relaxed break-words pl-0.5">
            {renderCommentContent(comment.content)}
          </p>
        </div>

        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-2 pt-1">
            {comment.replies.map(reply => (
              <CommentNode key={reply.id} comment={reply} isChild={true} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mt-4 pt-3 border-t border-white/10 space-y-4">
      {/* Reply Banner if Replying to a specific comment */}
      {replyingToComment && (
        <div className="flex items-center justify-between bg-[#121824] border border-[#3B6FF0]/30 rounded-lg px-3 py-2 text-xs text-slate-200">
          <div className="flex items-center space-x-1.5 truncate">
            <CornerDownRight className="w-3.5 h-3.5 text-[#3B6FF0] shrink-0" />
            <span>Respondiendo a <strong>@{replyingToComment.author.username}</strong></span>
          </div>
          <button 
            onClick={() => {
              setReplyingToComment(null);
              setNewCommentText('');
            }}
            className="text-[10px] text-slate-400 hover:text-white underline ml-2"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Write Comment Box */}
      <form onSubmit={(e) => handlePostComment(e, replyingToComment?.id)} className="flex items-center space-x-2">
        <img
          src={currentUser?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=vibe'}
          alt={currentUser?.display_name || 'Usuario'}
          className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10"
        />
        <div className="relative flex-1">
          <input
            type="text"
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder={
              replyingToComment 
                ? `Escribe tu respuesta a @${replyingToComment.author.username}...` 
                : "Añadir un comentario o mención (@usuario)..."
            }
            className="w-full bg-[#0A0E14] border border-white/10 rounded-lg pl-3 pr-10 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#3B6FF0] transition-colors"
          />
          <button
            type="submit"
            disabled={!newCommentText.trim() || submitting}
            className={`absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-all ${
              newCommentText.trim() && !submitting
                ? 'bg-[#3B6FF0] hover:bg-[#2E5EFF] text-white shadow-md shadow-[#3B6FF0]/20'
                : 'bg-white/5 text-slate-600 cursor-not-allowed'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      {/* Comment List Stream */}
      <div className="space-y-2.5 pt-1">
        {loading ? (
          <div className="flex items-center justify-center py-4 text-xs text-slate-400 space-x-2">
            <Sparkles className="w-3.5 h-3.5 animate-spin text-[#3B6FF0]" />
            <span>Cargando comentarios...</span>
          </div>
        ) : commentTree.length === 0 ? (
          <p className="text-center py-3 text-xs text-slate-500 italic">
            Aún no hay comentarios en esta publicación. ¡Sé el primero en opinar!
          </p>
        ) : (
          commentTree.map(comment => (
            <CommentNode key={comment.id} comment={comment} />
          ))
        )}
      </div>
    </div>
  );
};
