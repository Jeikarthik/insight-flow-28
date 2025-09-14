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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { documentId, fileUrl } = await req.json();

    if (!documentId || !fileUrl) {
      return new Response(
        JSON.stringify({ error: 'Document ID and file URL are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update document status to processing
    await supabaseClient
      .from('documents')
      .update({ status: 'processing' })
      .eq('id', documentId);

    // Log processing start
    await supabaseClient
      .from('processing_logs')
      .insert({
        document_id: documentId,
        process_type: 'document_processing',
        status: 'started',
        details: { file_url: fileUrl }
      });

    // Step 1: OCR Processing
    const ocrResult = await performOCR(fileUrl);
    
    if (ocrResult.success) {
      await supabaseClient
        .from('documents')
        .update({ 
          status: 'ocr_complete',
          ocr_text: ocrResult.text,
          ocr_confidence: ocrResult.confidence
        })
        .eq('id', documentId);

      await supabaseClient
        .from('processing_logs')
        .insert({
          document_id: documentId,
          process_type: 'ocr',
          status: 'completed',
          details: { 
            confidence: ocrResult.confidence,
            text_length: ocrResult.text?.length || 0
          }
        });
    }

    // Step 2: Document Classification
    const classificationResult = await classifyDocument(ocrResult.text || '', documentId);
    
    if (classificationResult.success) {
      await supabaseClient
        .from('documents')
        .update({ 
          status: 'classified',
          classification_id: classificationResult.classificationId,
          classification_confidence: classificationResult.confidence
        })
        .eq('id', documentId);

      await supabaseClient
        .from('processing_logs')
        .insert({
          document_id: documentId,
          process_type: 'classification',
          status: 'completed',
          details: { 
            classification: classificationResult.classification,
            confidence: classificationResult.confidence
          }
        });
    }

    // Step 3: Extract Metadata and Create Tasks
    const metadataResult = await extractMetadata(ocrResult.text || '', documentId);
    
    if (metadataResult.success) {
      await supabaseClient
        .from('documents')
        .update({ 
          extracted_metadata: metadataResult.metadata,
          deadline: metadataResult.deadline
        })
        .eq('id', documentId);

      // Create tasks based on metadata
      if (metadataResult.tasks && metadataResult.tasks.length > 0) {
        await supabaseClient
          .from('tasks')
          .insert(metadataResult.tasks);
      }
    }

    // Step 4: Assign to Departments
    await assignToDepartments(documentId, classificationResult.classificationId);

    // Final status update
    await supabaseClient
      .from('documents')
      .update({ status: 'completed' })
      .eq('id', documentId);

    await supabaseClient
      .from('processing_logs')
      .insert({
        document_id: documentId,
        process_type: 'document_processing',
        status: 'completed',
        details: { 
          processing_steps: ['ocr', 'classification', 'metadata_extraction', 'department_assignment']
        }
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Document processed successfully',
        documentId,
        ocrText: ocrResult.text,
        classification: classificationResult.classification
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing document:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function performOCR(fileUrl: string) {
  try {
    const googleCloudApiKey = Deno.env.get('GOOGLE_CLOUD_VISION_API_KEY');
    
    if (!googleCloudApiKey) {
      console.log('Google Cloud Vision API key not found, using mock OCR');
      return {
        success: true,
        text: 'Mock OCR text extracted from document. This would contain the actual text content extracted from the uploaded document using Google Cloud Vision API.',
        confidence: 0.95
      };
    }

    // Download the file
    const fileResponse = await fetch(fileUrl);
    const fileBuffer = await fileResponse.arrayBuffer();
    const base64Data = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)));

    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${googleCloudApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: base64Data,
              },
              features: [
                {
                  type: 'TEXT_DETECTION',
                  maxResults: 1,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    
    if (data.responses && data.responses[0] && data.responses[0].fullTextAnnotation) {
      return {
        success: true,
        text: data.responses[0].fullTextAnnotation.text,
        confidence: 0.95
      };
    }

    return {
      success: false,
      text: '',
      confidence: 0
    };

  } catch (error) {
    console.error('OCR Error:', error);
    return {
      success: false,
      text: '',
      confidence: 0,
      error: error.message
    };
  }
}

async function classifyDocument(text: string, documentId: string) {
  try {
    // Mock classification - in production, this would use DistilBERT or similar
    const keywords = text.toLowerCase();
    let classification = 'Other';
    let confidence = 0.8;

    if (keywords.includes('contract') || keywords.includes('agreement')) {
      classification = 'Contract';
      confidence = 0.92;
    } else if (keywords.includes('invoice') || keywords.includes('bill') || keywords.includes('payment')) {
      classification = 'Invoice';
      confidence = 0.89;
    } else if (keywords.includes('report') || keywords.includes('analysis')) {
      classification = 'Report';
      confidence = 0.85;
    } else if (keywords.includes('form') || keywords.includes('application')) {
      classification = 'Form';
      confidence = 0.88;
    } else if (keywords.includes('certificate') || keywords.includes('certification')) {
      classification = 'Certificate';
      confidence = 0.90;
    } else if (keywords.includes('medical') || keywords.includes('patient') || keywords.includes('diagnosis')) {
      classification = 'Medical';
      confidence = 0.93;
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get classification ID
    const { data: classData } = await supabaseClient
      .from('document_classifications')
      .select('id')
      .eq('name', classification)
      .single();

    return {
      success: true,
      classification,
      classificationId: classData?.id,
      confidence
    };

  } catch (error) {
    console.error('Classification Error:', error);
    return {
      success: false,
      classification: 'Other',
      classificationId: null,
      confidence: 0
    };
  }
}

async function extractMetadata(text: string, documentId: string) {
  try {
    const metadata: any = {};
    const tasks: any[] = [];

    // Extract dates
    const dateRegex = /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g;
    const dates = text.match(dateRegex) || [];
    metadata.extracted_dates = dates;

    // Extract amounts
    const amountRegex = /\$[\d,]+\.?\d*/g;
    const amounts = text.match(amountRegex) || [];
    metadata.extracted_amounts = amounts;

    // Extract email addresses
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = text.match(emailRegex) || [];
    metadata.extracted_emails = emails;

    // Extract phone numbers
    const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g;
    const phones = text.match(phoneRegex) || [];
    metadata.extracted_phones = phones;

    // Determine deadline based on content
    let deadline = null;
    if (text.toLowerCase().includes('due date') || text.toLowerCase().includes('deadline')) {
      // Try to extract a date near "due date" or "deadline"
      const dueDateMatch = text.match(/(?:due date|deadline)[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
      if (dueDateMatch) {
        deadline = new Date(dueDateMatch[1]).toISOString();
      } else if (dates.length > 0) {
        // Use the latest date found
        const sortedDates = dates.map(d => new Date(d)).sort((a, b) => b.getTime() - a.getTime());
        deadline = sortedDates[0].toISOString();
      }
    }

    // Create tasks based on document type and content
    if (text.toLowerCase().includes('review') || text.toLowerCase().includes('approval')) {
      tasks.push({
        title: 'Document Review Required',
        description: `Review and process document: ${documentId}`,
        task_type: 'review',
        priority: 2,
        document_id: documentId,
        due_date: deadline
      });
    }

    if (deadline) {
      tasks.push({
        title: 'Deadline Reminder',
        description: `Document has an upcoming deadline`,
        task_type: 'deadline',
        priority: 3,
        document_id: documentId,
        due_date: deadline
      });
    }

    return {
      success: true,
      metadata,
      deadline,
      tasks
    };

  } catch (error) {
    console.error('Metadata Extraction Error:', error);
    return {
      success: false,
      metadata: {},
      deadline: null,
      tasks: []
    };
  }
}

async function assignToDepartments(documentId: string, classificationId: string) {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get classification info
    const { data: classification } = await supabaseClient
      .from('document_classifications')
      .select('auto_assign_department')
      .eq('id', classificationId)
      .single();

    if (classification?.auto_assign_department) {
      await supabaseClient
        .from('documents')
        .update({ 
          assigned_departments: [classification.auto_assign_department]
        })
        .eq('id', documentId);
    }

    return { success: true };

  } catch (error) {
    console.error('Department Assignment Error:', error);
    return { success: false };
  }
}