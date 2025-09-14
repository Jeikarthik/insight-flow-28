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
    const { source, data, metadata } = await req.json();

    if (!source || !data) {
      return new Response(
        JSON.stringify({ error: 'Source and data are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    let result;

    switch (source) {
      case 'sharepoint':
        result = await processSharePointData(data, metadata, supabaseClient);
        break;
      case 'email':
        result = await processEmailData(data, metadata, supabaseClient);
        break;
      case 'whatsapp':
        result = await processWhatsAppData(data, metadata, supabaseClient);
        break;
      case 'api':
        result = await processAPIData(data, metadata, supabaseClient);
        break;
      default:
        throw new Error(`Unsupported source: ${source}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        result
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in external ingestion:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function processSharePointData(data: any, metadata: any, supabaseClient: any) {
  try {
    const microsoftGraphApiKey = Deno.env.get('MICROSOFT_GRAPH_API_KEY');
    
    if (!microsoftGraphApiKey) {
      throw new Error('Microsoft Graph API key not configured');
    }

    // Process SharePoint files
    const processedDocuments = [];
    
    for (const item of data.items || []) {
      if (item.file) {
        // Download file from SharePoint
        const fileResponse = await fetch(item.downloadUrl, {
          headers: {
            'Authorization': `Bearer ${microsoftGraphApiKey}`
          }
        });

        if (fileResponse.ok) {
          const fileBuffer = await fileResponse.arrayBuffer();
          
          // Upload to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabaseClient.storage
            .from('documents')
            .upload(
              `sharepoint/${item.id}_${item.name}`,
              fileBuffer,
              {
                contentType: item.file.mimeType,
                metadata: {
                  source: 'sharepoint',
                  originalId: item.id,
                  sharePointPath: item.webUrl
                }
              }
            );

          if (!uploadError) {
            // Create document record
            const { data: document } = await supabaseClient
              .from('documents')
              .insert({
                filename: `sharepoint_${item.name}`,
                original_filename: item.name,
                file_size: item.size,
                mime_type: item.file.mimeType,
                file_path: uploadData.path,
                status: 'uploaded',
                extracted_metadata: {
                  source: 'sharepoint',
                  sharepoint_id: item.id,
                  sharepoint_url: item.webUrl,
                  created_by_sharepoint: item.createdBy?.user?.displayName,
                  modified_date_sharepoint: item.lastModifiedDateTime
                },
                uploaded_by: metadata.userId
              })
              .select()
              .single();

            if (document) {
              // Trigger document processing
              await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/process-document`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  documentId: document.id,
                  fileUrl: `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/documents/${uploadData.path}`
                })
              });

              processedDocuments.push(document);
            }
          }
        }
      }
    }

    return {
      source: 'sharepoint',
      processed_count: processedDocuments.length,
      documents: processedDocuments
    };

  } catch (error) {
    console.error('SharePoint processing error:', error);
    throw error;
  }
}

async function processEmailData(data: any, metadata: any, supabaseClient: any) {
  try {
    const microsoftGraphApiKey = Deno.env.get('MICROSOFT_GRAPH_API_KEY');
    
    if (!microsoftGraphApiKey) {
      throw new Error('Microsoft Graph API key not configured');
    }

    const processedEmails = [];

    for (const email of data.emails || []) {
      // Process email attachments
      if (email.hasAttachments && email.attachments) {
        for (const attachment of email.attachments) {
          if (attachment.contentBytes) {
            const fileBuffer = new Uint8Array(atob(attachment.contentBytes).split('').map(c => c.charCodeAt(0)));
            
            // Upload attachment to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabaseClient.storage
              .from('documents')
              .upload(
                `email/${email.id}_${attachment.name}`,
                fileBuffer,
                {
                  contentType: attachment.contentType,
                  metadata: {
                    source: 'email',
                    emailId: email.id,
                    emailSubject: email.subject,
                    emailSender: email.from?.emailAddress?.address
                  }
                }
              );

            if (!uploadError) {
              // Create document record
              const { data: document } = await supabaseClient
                .from('documents')
                .insert({
                  filename: `email_${attachment.name}`,
                  original_filename: attachment.name,
                  file_size: attachment.size,
                  mime_type: attachment.contentType,
                  file_path: uploadData.path,
                  status: 'uploaded',
                  extracted_metadata: {
                    source: 'email',
                    email_id: email.id,
                    email_subject: email.subject,
                    email_sender: email.from?.emailAddress?.address,
                    email_received: email.receivedDateTime
                  },
                  uploaded_by: metadata.userId
                })
                .select()
                .single();

              if (document) {
                // Trigger document processing
                await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/process-document`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    documentId: document.id,
                    fileUrl: `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/documents/${uploadData.path}`
                  })
                });

                processedEmails.push(document);
              }
            }
          }
        }
      }

      // Also process email body as text document if it contains important content
      if (email.body?.content && email.body.content.length > 100) {
        const emailContent = `Subject: ${email.subject}\nFrom: ${email.from?.emailAddress?.address}\nDate: ${email.receivedDateTime}\n\n${email.body.content}`;
        
        const { data: uploadData, error: uploadError } = await supabaseClient.storage
          .from('documents')
          .upload(
            `email/${email.id}_content.txt`,
            new TextEncoder().encode(emailContent),
            {
              contentType: 'text/plain',
              metadata: {
                source: 'email',
                emailId: email.id,
                type: 'email_content'
              }
            }
          );

        if (!uploadError) {
          const { data: document } = await supabaseClient
            .from('documents')
            .insert({
              filename: `email_content_${email.subject?.slice(0, 50) || 'no_subject'}.txt`,
              original_filename: `${email.subject || 'Email Content'}.txt`,
              file_size: emailContent.length,
              mime_type: 'text/plain',
              file_path: uploadData.path,
              status: 'uploaded',
              extracted_metadata: {
                source: 'email',
                email_id: email.id,
                email_subject: email.subject,
                email_sender: email.from?.emailAddress?.address,
                email_received: email.receivedDateTime,
                type: 'email_content'
              },
              uploaded_by: metadata.userId
            })
            .select()
            .single();

          if (document) {
            processedEmails.push(document);
          }
        }
      }
    }

    return {
      source: 'email',
      processed_count: processedEmails.length,
      documents: processedEmails
    };

  } catch (error) {
    console.error('Email processing error:', error);
    throw error;
  }
}

async function processWhatsAppData(data: any, metadata: any, supabaseClient: any) {
  try {
    const whatsappApiKey = Deno.env.get('WHATSAPP_BUSINESS_API_KEY');
    
    if (!whatsappApiKey) {
      throw new Error('WhatsApp Business API key not configured');
    }

    const processedMessages = [];

    for (const message of data.messages || []) {
      // Process media messages (documents, images, etc.)
      if (message.type === 'document' || message.type === 'image') {
        const mediaId = message[message.type]?.id;
        
        if (mediaId) {
          // Download media from WhatsApp
          const mediaResponse = await fetch(
            `https://graph.facebook.com/v18.0/${mediaId}`,
            {
              headers: {
                'Authorization': `Bearer ${whatsappApiKey}`
              }
            }
          );

          const mediaInfo = await mediaResponse.json();
          
          if (mediaInfo.url) {
            const fileResponse = await fetch(mediaInfo.url, {
              headers: {
                'Authorization': `Bearer ${whatsappApiKey}`
              }
            });

            if (fileResponse.ok) {
              const fileBuffer = await fileResponse.arrayBuffer();
              
              // Upload to Supabase Storage
              const filename = message[message.type]?.filename || `whatsapp_${message.id}`;
              const { data: uploadData, error: uploadError } = await supabaseClient.storage
                .from('documents')
                .upload(
                  `whatsapp/${message.id}_${filename}`,
                  fileBuffer,
                  {
                    contentType: message[message.type]?.mime_type || 'application/octet-stream',
                    metadata: {
                      source: 'whatsapp',
                      messageId: message.id,
                      senderPhone: message.from,
                      timestamp: message.timestamp
                    }
                  }
                );

              if (!uploadError) {
                // Create document record
                const { data: document } = await supabaseClient
                  .from('documents')
                  .insert({
                    filename: `whatsapp_${filename}`,
                    original_filename: filename,
                    file_size: parseInt(mediaInfo.file_size || '0'),
                    mime_type: message[message.type]?.mime_type,
                    file_path: uploadData.path,
                    status: 'uploaded',
                    extracted_metadata: {
                      source: 'whatsapp',
                      message_id: message.id,
                      sender_phone: message.from,
                      timestamp: message.timestamp,
                      caption: message[message.type]?.caption
                    },
                    uploaded_by: metadata.userId
                  })
                  .select()
                  .single();

                if (document) {
                  // Trigger document processing
                  await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/process-document`, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      documentId: document.id,
                      fileUrl: `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/documents/${uploadData.path}`
                    })
                  });

                  processedMessages.push(document);
                }
              }
            }
          }
        }
      }
    }

    return {
      source: 'whatsapp',
      processed_count: processedMessages.length,
      documents: processedMessages
    };

  } catch (error) {
    console.error('WhatsApp processing error:', error);
    throw error;
  }
}

async function processAPIData(data: any, metadata: any, supabaseClient: any) {
  try {
    // Generic API data processing
    const processedItems = [];

    for (const item of data.items || []) {
      if (item.fileUrl || item.content) {
        let fileBuffer: ArrayBuffer;
        let filename: string;
        let mimeType: string;

        if (item.fileUrl) {
          // Download from URL
          const response = await fetch(item.fileUrl);
          if (response.ok) {
            fileBuffer = await response.arrayBuffer();
            filename = item.filename || 'api_document';
            mimeType = response.headers.get('content-type') || 'application/octet-stream';
          } else {
            continue;
          }
        } else if (item.content) {
          // Process direct content
          fileBuffer = new TextEncoder().encode(item.content);
          filename = item.filename || 'api_content.txt';
          mimeType = 'text/plain';
        } else {
          continue;
        }

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabaseClient.storage
          .from('documents')
          .upload(
            `api/${Date.now()}_${filename}`,
            fileBuffer,
            {
              contentType: mimeType,
              metadata: {
                source: 'api',
                apiSource: metadata.apiSource || 'external',
                originalData: item
              }
            }
          );

        if (!uploadError) {
          // Create document record
          const { data: document } = await supabaseClient
            .from('documents')
            .insert({
              filename: `api_${filename}`,
              original_filename: filename,
              file_size: fileBuffer.byteLength,
              mime_type: mimeType,
              file_path: uploadData.path,
              status: 'uploaded',
              extracted_metadata: {
                source: 'api',
                api_source: metadata.apiSource || 'external',
                original_data: item
              },
              uploaded_by: metadata.userId
            })
            .select()
            .single();

          if (document) {
            // Trigger document processing
            await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/process-document`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                documentId: document.id,
                fileUrl: `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/documents/${uploadData.path}`
              })
            });

            processedItems.push(document);
          }
        }
      }
    }

    return {
      source: 'api',
      processed_count: processedItems.length,
      documents: processedItems
    };

  } catch (error) {
    console.error('API processing error:', error);
    throw error;
  }
}