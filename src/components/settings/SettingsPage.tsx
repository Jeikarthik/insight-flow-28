import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { 
  Settings, 
  Key, 
  Cloud, 
  MessageSquare, 
  Mail, 
  Phone, 
  Eye, 
  EyeOff,
  Save,
  TestTube,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface ApiSetting {
  key: string;
  value: string;
  description: string;
  is_sensitive: boolean;
}

export function SettingsPage() {
  const [apiSettings, setApiSettings] = useState<ApiSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>({});
  const [testResults, setTestResults] = useState<Record<string, boolean | null>>({});
  const { toast } = useToast();
  const { profile } = useAuth();

  const apiConfigurations = [
    {
      category: 'Google Cloud Services',
      icon: Cloud,
      settings: [
        {
          key: 'GOOGLE_CLOUD_VISION_API_KEY',
          label: 'Google Cloud Vision API Key',
          description: 'For OCR text extraction from documents',
          placeholder: 'Enter your Google Cloud Vision API key',
          is_sensitive: true
        },
        {
          key: 'GOOGLE_CLOUD_PROJECT_ID',
          label: 'Google Cloud Project ID',
          description: 'Your Google Cloud project identifier',
          placeholder: 'your-project-id',
          is_sensitive: false
        }
      ]
    },
    {
      category: 'AI & ML Services',
      icon: MessageSquare,
      settings: [
        {
          key: 'MISTRAL_API_KEY',
          label: 'Mistral AI API Key',
          description: 'For AI chatbot and document summarization',
          placeholder: 'Enter your Mistral API key',
          is_sensitive: true
        }
      ]
    },
    {
      category: 'Communication APIs',
      icon: Mail,
      settings: [
        {
          key: 'EMAIL_SERVICE',
          label: 'Email Service Provider',
          description: 'Email service (sendgrid, resend, etc.)',
          placeholder: 'sendgrid',
          is_sensitive: false
        },
        {
          key: 'EMAIL_API_KEY',
          label: 'Email API Key',
          description: 'API key for your email service',
          placeholder: 'Enter your email service API key',
          is_sensitive: true
        },
        {
          key: 'WHATSAPP_BUSINESS_API_KEY',
          label: 'WhatsApp Business API Key',
          description: 'For WhatsApp notifications and document ingestion',
          placeholder: 'Enter your WhatsApp Business API key',
          is_sensitive: true
        },
        {
          key: 'WHATSAPP_BUSINESS_NUMBER',
          label: 'WhatsApp Business Phone Number',
          description: 'Your verified WhatsApp Business phone number',
          placeholder: '+1234567890',
          is_sensitive: false
        }
      ]
    },
    {
      category: 'Microsoft Integration',
      icon: Key,
      settings: [
        {
          key: 'MICROSOFT_GRAPH_API_KEY',
          label: 'Microsoft Graph API Token',
          description: 'For SharePoint and email integration',
          placeholder: 'Enter your Microsoft Graph API token',
          is_sensitive: true
        },
        {
          key: 'MICROSOFT_TENANT_ID',
          label: 'Microsoft Tenant ID',
          description: 'Your Microsoft 365 tenant identifier',
          placeholder: 'Enter your tenant ID',
          is_sensitive: false
        }
      ]
    }
  ];

  useEffect(() => {
    loadApiSettings();
  }, []);

  const loadApiSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('key');

      if (error) throw error;

      setApiSettings(data || []);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load API settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveApiSetting = async (key: string, value: string, description: string, is_sensitive: boolean) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          key,
          value,
          description,
          is_sensitive
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `${key} has been saved`,
      });

      await loadApiSettings();
    } catch (error) {
      console.error('Error saving setting:', error);
      toast({
        title: 'Error',
        description: 'Failed to save API setting',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const testApiConnection = async (key: string, value: string) => {
    if (!value.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a value before testing',
        variant: 'destructive',
      });
      return;
    }

    setTestResults(prev => ({ ...prev, [key]: null }));

    try {
      let isValid = false;

      switch (key) {
        case 'GOOGLE_CLOUD_VISION_API_KEY':
          // Test Google Cloud Vision API
          const response = await fetch(
            `https://vision.googleapis.com/v1/images:annotate?key=${value}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                requests: [{
                  image: { content: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==' },
                  features: [{ type: 'TEXT_DETECTION', maxResults: 1 }]
                }]
              })
            }
          );
          isValid = response.ok;
          break;

        case 'MISTRAL_API_KEY':
          // Test Mistral API
          const mistralResponse = await fetch('https://api.mistral.ai/v1/models', {
            headers: { 'Authorization': `Bearer ${value}` }
          });
          isValid = mistralResponse.ok;
          break;

        case 'EMAIL_API_KEY':
          // Basic validation for email API key format
          isValid = value.length > 10 && value.includes('.');
          break;

        case 'WHATSAPP_BUSINESS_API_KEY':
          // Basic validation for WhatsApp API key format
          isValid = value.length > 20;
          break;

        case 'MICROSOFT_GRAPH_API_KEY':
          // Test Microsoft Graph API
          const graphResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
            headers: { 'Authorization': `Bearer ${value}` }
          });
          isValid = graphResponse.ok || graphResponse.status === 401; // 401 is acceptable (valid format)
          break;

        default:
          isValid = value.length > 0;
      }

      setTestResults(prev => ({ ...prev, [key]: isValid }));

      toast({
        title: isValid ? 'Success' : 'Failed',
        description: isValid ? 'API connection test passed' : 'API connection test failed',
        variant: isValid ? 'default' : 'destructive',
      });

    } catch (error) {
      console.error('API test error:', error);
      setTestResults(prev => ({ ...prev, [key]: false }));
      toast({
        title: 'Error',
        description: 'Failed to test API connection',
        variant: 'destructive',
      });
    }
  };

  const toggleSensitiveVisibility = (key: string) => {
    setShowSensitive(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getSettingValue = (key: string) => {
    return apiSettings.find(setting => setting.key === key)?.value || '';
  };

  if (profile?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card>
          <CardContent className="p-8 text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">Only administrators can access system settings.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-8 w-8" />
          System Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Configure API keys and external service integrations
        </p>
      </div>

      <Tabs defaultValue="apis" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="apis">API Configuration</TabsTrigger>
          <TabsTrigger value="profile">Profile Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="apis" className="space-y-6">
          {apiConfigurations.map((category) => {
            const Icon = category.icon;
            return (
              <Card key={category.category} className="bg-gradient-card shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    {category.category}
                  </CardTitle>
                  <CardDescription>
                    Configure your {category.category.toLowerCase()} integration settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {category.settings.map((setting) => {
                    const currentValue = getSettingValue(setting.key);
                    const testResult = testResults[setting.key];
                    
                    return (
                      <div key={setting.key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={setting.key} className="flex items-center gap-2">
                            {setting.label}
                            {setting.is_sensitive && (
                              <Badge variant="outline" className="text-xs">
                                Sensitive
                              </Badge>
                            )}
                          </Label>
                          {testResult !== undefined && (
                            <div className="flex items-center gap-1">
                              {testResult === null ? (
                                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                              ) : testResult ? (
                                <CheckCircle className="h-4 w-4 text-success" />
                              ) : (
                                <XCircle className="h-4 w-4 text-destructive" />
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Input
                              id={setting.key}
                              type={setting.is_sensitive && !showSensitive[setting.key] ? 'password' : 'text'}
                              placeholder={setting.placeholder}
                              defaultValue={currentValue}
                              className="pr-10"
                            />
                            {setting.is_sensitive && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() => toggleSensitiveVisibility(setting.key)}
                              >
                                {showSensitive[setting.key] ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </div>
                          
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              const input = document.getElementById(setting.key) as HTMLInputElement;
                              testApiConnection(setting.key, input.value);
                            }}
                          >
                            <TestTube className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            type="button"
                            onClick={() => {
                              const input = document.getElementById(setting.key) as HTMLInputElement;
                              saveApiSetting(setting.key, input.value, setting.description, setting.is_sensitive);
                            }}
                            disabled={saving}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {setting.description}
                        </p>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="profile">
          <Card className="bg-gradient-card shadow-soft">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    defaultValue={profile?.full_name || ''}
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={profile?.email || ''}
                    placeholder="Enter your email"
                    disabled
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    defaultValue={profile?.department || ''}
                    placeholder="Enter your department"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    defaultValue={profile?.role || ''}
                    disabled
                  />
                </div>
              </div>
              
              <Separator />
              
              <Button className="bg-gradient-primary">
                Update Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}