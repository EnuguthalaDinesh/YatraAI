import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ChatMessage } from '@/types';

export function useChatMessages() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['chatMessages', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data.map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        createdAt: msg.created_at,
      })) as ChatMessage[];
    },
    enabled: !!user,
  });

  const addMessage = useMutation({
    mutationFn: async (message: { role: 'user' | 'assistant'; content: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          user_id: user.id,
          role: message.role,
          content: message.content,
        })
        .select()
        .single();
      
      if (error) throw error;
      return {
        id: data.id,
        role: data.role as 'user' | 'assistant',
        content: data.content,
        createdAt: data.created_at,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages', user?.id] });
    },
  });

  const clearMessages = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages', user?.id] });
    },
  });

  return { messages, isLoading, addMessage, clearMessages };
}
