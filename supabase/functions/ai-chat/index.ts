import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message, sessionId, userId } = await req.json();

    if (!message || !userId) {
      return new Response(
        JSON.stringify({ error: 'Message and user ID are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get or create chat session
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const { data: newSession } = await supabaseClient
        .from('chat_sessions')
        .insert({
          user_id: userId,
          title: message.slice(0, 50) + '...'
        })
        .select()
        .single();
      
      currentSessionId = newSession?.id;
    }

    // Save user message
    await supabaseClient
      .from('chat_messages')
      .insert({
        session_id: currentSessionId,
        role: 'user',
        content: message
      });

    // Get user's documents for context
    const { data: userDocuments } = await supabaseClient
      .from('documents')
      .select('id, filename, ocr_text, classification_id, created_at, document_classifications(name)')
      .eq('uploaded_by', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get user's tasks for context
    const { data: userTasks } = await supabaseClient
      .from('tasks')
      .select('id, title, description, status, priority, due_date')
      .eq('assigned_to', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    // Generate AI response
    const aiResponse = await generateAIResponse(message, userDocuments, userTasks);

    // Save AI response
    await supabaseClient
      .from('chat_messages')
      .insert({
        session_id: currentSessionId,
        role: 'assistant',
        content: aiResponse,
        metadata: {
          documents_referenced: userDocuments?.length || 0,
          tasks_referenced: userTasks?.length || 0
        }
      });

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        sessionId: currentSessionId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in AI chat:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateAIResponse(message: string, documents: any[], tasks: any[]) {
  try {
    const mistralApiKey = Deno.env.get('MISTRAL_API_KEY');
    
    if (!mistralApiKey) {
      return generateMockResponse(message, documents, tasks);
    }

    // Build context from user's documents and tasks
    const documentsContext = documents?.map(doc => 
      `Document: ${doc.filename} (Type: ${doc.document_classifications?.name}) - ${doc.ocr_text?.slice(0, 200)}...`
    ).join('\n') || '';

    const tasksContext = tasks?.map(task => 
      `Task: ${task.title} - Status: ${task.status}, Priority: ${task.priority}, Due: ${task.due_date}`
    ).join('\n') || '';

    const systemPrompt = `You are DocFlow Pro AI Assistant, specialized in document management and workflow automation. 

User's Documents:
${documentsContext}

User's Tasks:
${tasksContext}

You can help with:
- Summarizing documents
- Extracting information from documents
- Managing tasks and deadlines
- Document classification insights
- Workflow optimization
- Progress tracking

Be helpful, concise, and focused on document management workflows.`;

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mistralApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    const data = await response.json();
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    }

    return generateMockResponse(message, documents, tasks);

  } catch (error) {
    console.error('Mistral API Error:', error);
    return generateMockResponse(message, documents, tasks);
  }
}

function generateMockResponse(message: string, documents: any[], tasks: any[]) {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('summary') || lowerMessage.includes('summarize')) {
    if (documents && documents.length > 0) {
      return `Based on your recent documents, I can see you have ${documents.length} documents including ${documents.map(d => d.document_classifications?.name || 'unknown type').join(', ')}. The most recent document "${documents[0]?.filename}" appears to be a ${documents[0]?.document_classifications?.name || 'document'} that was uploaded recently. Would you like me to provide a detailed summary of any specific document?`;
    }
    return "I can help you summarize documents once you upload them. You can drag and drop files in the upload zone and I'll process them for you.";
  }

  if (lowerMessage.includes('task') || lowerMessage.includes('deadline')) {
    if (tasks && tasks.length > 0) {
      const pendingTasks = tasks.filter(t => t.status === 'pending');
      const highPriorityTasks = tasks.filter(t => t.priority >= 4);
      
      return `You have ${tasks.length} tasks total. ${pendingTasks.length} are still pending${highPriorityTasks.length > 0 ? `, including ${highPriorityTasks.length} high-priority items` : ''}. ${tasks.find(t => t.due_date) ? 'Some tasks have upcoming deadlines - would you like me to prioritize them for you?' : 'Most tasks don\'t have specific deadlines set.'}`;
    }
    return "You don't have any active tasks at the moment. Tasks are automatically created when documents are processed, or you can create them manually.";
  }

  if (lowerMessage.includes('document') || lowerMessage.includes('file')) {
    if (documents && documents.length > 0) {
      const recentDoc = documents[0];
      return `Your most recent document is "${recentDoc.filename}" classified as ${recentDoc.document_classifications?.name || 'unknown type'}. You have ${documents.length} documents total. I can help you search through them, extract specific information, or create summaries. What would you like to know?`;
    }
    return "You haven't uploaded any documents yet. Use the upload zone to add documents and I'll automatically process them with OCR and classification.";
  }

  if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
    return `I'm your DocFlow Pro AI assistant! I can help you with:

📄 **Document Analysis**: Summarize content, extract key information
📋 **Task Management**: Review deadlines, prioritize work, track progress  
🔍 **Search & Insights**: Find specific documents or information
📊 **Workflow Optimization**: Suggest improvements to your document processes
🏷️ **Classification**: Help identify and categorize documents

You have ${documents?.length || 0} documents and ${tasks?.length || 0} tasks in your system. What would you like to explore?`;
  }

  // Default response
  return `I understand you're asking about "${message}". As your DocFlow Pro AI assistant, I can help you manage your documents, tasks, and workflows. You currently have ${documents?.length || 0} documents and ${tasks?.length || 0} tasks. 

Could you please be more specific about what you'd like me to help you with? I can:
- Analyze and summarize your documents
- Help prioritize your tasks
- Extract specific information
- Provide workflow insights`;
}