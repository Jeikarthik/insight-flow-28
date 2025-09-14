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
    const { 
      userId, 
      title, 
      message, 
      type = 'info',
      documentId,
      taskId,
      sendEmail = false,
      sendWhatsApp = false 
    } = await req.json();

    if (!userId || !title || !message) {
      return new Response(
        JSON.stringify({ error: 'User ID, title, and message are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Create notification in database
    const { data: notification, error } = await supabaseClient
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        document_id: documentId,
        task_id: taskId
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Get user profile for contact information
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single();

    const results = {
      notificationId: notification.id,
      emailSent: false,
      whatsappSent: false
    };

    // Send email notification if requested
    if (sendEmail && profile?.email) {
      try {
        const emailResult = await sendEmailNotification(profile.email, profile.full_name, title, message);
        results.emailSent = emailResult.success;
        
        // Update notification with email status
        await supabaseClient
          .from('notifications')
          .update({ sent_via_email: emailResult.success })
          .eq('id', notification.id);
          
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }
    }

    // Send WhatsApp notification if requested
    if (sendWhatsApp) {
      try {
        const whatsappResult = await sendWhatsAppNotification(userId, title, message);
        results.whatsappSent = whatsappResult.success;
        
        // Update notification with WhatsApp status
        await supabaseClient
          .from('notifications')
          .update({ sent_via_whatsapp: whatsappResult.success })
          .eq('id', notification.id);
          
      } catch (whatsappError) {
        console.error('WhatsApp sending failed:', whatsappError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        ...results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function sendEmailNotification(email: string, fullName: string, title: string, message: string) {
  try {
    // Using a simple email service - in production, you might use SendGrid, Resend, etc.
    const emailApiKey = Deno.env.get('EMAIL_API_KEY');
    const emailService = Deno.env.get('EMAIL_SERVICE'); // 'sendgrid', 'resend', etc.
    
    if (!emailApiKey) {
      console.log('Email API key not configured, skipping email send');
      return { success: false, message: 'Email service not configured' };
    }

    // Example for SendGrid
    if (emailService === 'sendgrid') {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${emailApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email, name: fullName }],
              subject: `DocFlow Pro: ${title}`
            }
          ],
          from: {
            email: 'notifications@docflowpro.com',
            name: 'DocFlow Pro'
          },
          content: [
            {
              type: 'text/html',
              value: `
                <h2>${title}</h2>
                <p>Hello ${fullName},</p>
                <p>${message}</p>
                <br>
                <p>Best regards,<br>DocFlow Pro Team</p>
                <hr>
                <small>This is an automated notification from your DocFlow Pro system.</small>
              `
            }
          ]
        }),
      });

      if (response.ok) {
        return { success: true };
      } else {
        const errorData = await response.text();
        console.error('SendGrid error:', errorData);
        return { success: false, message: 'Failed to send email' };
      }
    }

    // Mock success for development
    console.log(`Mock email sent to ${email}: ${title} - ${message}`);
    return { success: true };

  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, message: error.message };
  }
}

async function sendWhatsAppNotification(userId: string, title: string, message: string) {
  try {
    const whatsappApiKey = Deno.env.get('WHATSAPP_BUSINESS_API_KEY');
    const whatsappNumber = Deno.env.get('WHATSAPP_BUSINESS_NUMBER');
    
    if (!whatsappApiKey || !whatsappNumber) {
      console.log('WhatsApp API not configured, skipping WhatsApp send');
      return { success: false, message: 'WhatsApp service not configured' };
    }

    // Get user's phone number from profile or system settings
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('phone_number')
      .eq('id', userId)
      .single();

    if (!profile?.phone_number) {
      return { success: false, message: 'User phone number not found' };
    }

    // Example for WhatsApp Business API
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${whatsappNumber}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${whatsappApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: profile.phone_number,
          type: 'template',
          template: {
            name: 'notification_template', // You'd need to create this template
            language: {
              code: 'en'
            },
            components: [
              {
                type: 'body',
                parameters: [
                  {
                    type: 'text',
                    text: title
                  },
                  {
                    type: 'text',
                    text: message
                  }
                ]
              }
            ]
          }
        }),
      }
    );

    if (response.ok) {
      return { success: true };
    } else {
      const errorData = await response.text();
      console.error('WhatsApp API error:', errorData);
      return { success: false, message: 'Failed to send WhatsApp message' };
    }

  } catch (error) {
    console.error('WhatsApp sending error:', error);
    return { success: false, message: error.message };
  }
}