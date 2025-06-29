'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WhatsAppTemplate } from '@/types/communication';
import { Lead } from '@/types/lead';
import { WhatsAppService } from '@/lib/whatsappService';
import { MessageCircle, Send, BookTemplate as Template, User, Phone } from 'lucide-react';

interface WhatsAppModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead;
  onMessageSent?: (leadId: string, message: string) => void;
}

export function WhatsAppModal({ open, onOpenChange, lead, onMessageSent }: WhatsAppModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customMessage, setCustomMessage] = useState('');
  const [processedMessage, setProcessedMessage] = useState('');
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);

  const whatsappService = WhatsAppService.getInstance();

  useEffect(() => {
    // Load default templates (in real app, fetch from API)
    const defaultTemplates = whatsappService.getDefaultTemplates();
    const templatesWithIds: WhatsAppTemplate[] = defaultTemplates.map((template, index) => ({
      ...template,
      id: `template-${index + 1}`,
      createdBy: 'system',
      createdAt: new Date(),
    }));
    setTemplates(templatesWithIds);
  }, []);

  useEffect(() => {
    if (selectedTemplate) {
      const template = templates.find(t => t.id === selectedTemplate);
      if (template) {
        const leadData = {
          lead_name: lead.name,
          property_type: lead.propertyType,
          property_location: lead.preferredLocations.join(', '),
          property_price: lead.budgetRange,
          property_features: 'Modern amenities, great location',
          agent_name: 'Your Agent Name',
          agent_phone: '+1-555-0123',
          meeting_date: 'Tomorrow',
          meeting_time: '2:00 PM',
          meeting_location: 'Property Office',
        };
        
        const processed = whatsappService.processTemplate(template, leadData);
        setProcessedMessage(processed);
        setCustomMessage(processed);
      }
    } else {
      setProcessedMessage('');
      setCustomMessage('');
    }
  }, [selectedTemplate, templates, lead]);

  const handleSendMessage = () => {
    const messageToSend = customMessage || processedMessage;
    if (!messageToSend.trim()) return;

    if (!whatsappService.isValidPhoneNumber(lead.primaryPhone)) {
      alert('Invalid phone number format. Please check the lead\'s phone number.');
      return;
    }

    whatsappService.sendMessage(lead.primaryPhone, messageToSend);
    onMessageSent?.(lead.id, messageToSend);
    onOpenChange(false);
    
    // Reset form
    setSelectedTemplate('');
    setCustomMessage('');
    setProcessedMessage('');
  };

  const getTemplatesByCategory = (category: string) => {
    return templates.filter(t => t.category === category && t.isActive);
  };

  const templateCategories = [
    { key: 'property-share', label: 'Property Details', icon: '🏠' },
    { key: 'follow-up', label: 'Follow-up', icon: '📞' },
    { key: 'meeting', label: 'Meeting', icon: '📅' },
    { key: 'thank-you', label: 'Thank You', icon: '🙏' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            <span>Send WhatsApp Message</span>
          </DialogTitle>
          <DialogDescription>
            Send a WhatsApp message to {lead.name} ({lead.primaryPhone})
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Templates */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Template className="h-5 w-5" />
                  <span>Message Templates</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {templateCategories.map(category => {
                  const categoryTemplates = getTemplatesByCategory(category.key);
                  if (categoryTemplates.length === 0) return null;

                  return (
                    <div key={category.key}>
                      <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center space-x-1">
                        <span>{category.icon}</span>
                        <span>{category.label}</span>
                      </h4>
                      <div className="space-y-2">
                        {categoryTemplates.map(template => (
                          <Button
                            key={template.id}
                            variant={selectedTemplate === template.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedTemplate(template.id)}
                            className="w-full justify-start text-left h-auto p-3"
                          >
                            <div>
                              <div className="font-medium">{template.name}</div>
                              <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {template.content.substring(0, 80)}...
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  );
                })}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedTemplate('');
                    setCustomMessage('');
                  }}
                  className="w-full"
                >
                  Write Custom Message
                </Button>
              </CardContent>
            </Card>

            {/* Lead Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <User className="h-5 w-5" />
                  <span>Lead Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Name:</span>
                  <span className="font-medium">{lead.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Phone:</span>
                  <span className="font-medium flex items-center space-x-1">
                    <Phone className="h-3 w-3" />
                    <span>{lead.primaryPhone}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Property Type:</span>
                  <Badge variant="outline">{lead.propertyType}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Budget:</span>
                  <span className="font-medium text-sm">{lead.budgetRange}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Locations:</span>
                  <span className="font-medium text-sm">{lead.preferredLocations.join(', ')}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Message Composer */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Send className="h-5 w-5" />
                  <span>Message Preview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Type your custom message here or select a template..."
                  rows={12}
                  className="resize-none"
                />
                
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-600 mb-2">Character count: {customMessage.length}</div>
                  <div className="text-xs text-gray-600">
                    This will open WhatsApp with the message pre-filled. You can edit it before sending.
                  </div>
                </div>
              </CardContent>
            </Card>

            {selectedTemplate && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Template Placeholders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-gray-600 mb-2">
                    The following placeholders will be automatically replaced:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {templates.find(t => t.id === selectedTemplate)?.placeholders.map(placeholder => (
                      <Badge key={placeholder} variant="secondary" className="text-xs">
                        {`{{${placeholder}}}`}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSendMessage}
            disabled={!customMessage.trim()}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Send via WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}