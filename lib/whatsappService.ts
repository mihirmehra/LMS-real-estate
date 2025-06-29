'use client';

import { WhatsAppTemplate } from '@/types/communication';

export class WhatsAppService {
  private static instance: WhatsAppService;

  static getInstance(): WhatsAppService {
    if (!WhatsAppService.instance) {
      WhatsAppService.instance = new WhatsAppService();
    }
    return WhatsAppService.instance;
  }

  // Format phone number for WhatsApp (remove non-digits and ensure proper format)
  formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    // Add country code if not present (assuming US +1 for demo)
    if (cleaned.length === 10) {
      return `1${cleaned}`;
    }
    return cleaned;
  }

  // Create WhatsApp Web URL with pre-filled message
  createWhatsAppURL(phoneNumber: string, message: string): string {
    const formattedPhone = this.formatPhoneNumber(phoneNumber);
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
  }

  // Replace placeholders in template with actual values
  processTemplate(template: WhatsAppTemplate, data: Record<string, string>): string {
    let processedContent = template.content;
    
    template.placeholders.forEach(placeholder => {
      const value = data[placeholder] || `{{${placeholder}}}`;
      const regex = new RegExp(`{{${placeholder}}}`, 'g');
      processedContent = processedContent.replace(regex, value);
    });

    return processedContent;
  }

  // Open WhatsApp with message
  sendMessage(phoneNumber: string, message: string): void {
    const url = this.createWhatsAppURL(phoneNumber, message);
    window.open(url, '_blank');
  }

  // Validate phone number format
  isValidPhoneNumber(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
  }

  // Extract placeholders from template content
  extractPlaceholders(content: string): string[] {
    const regex = /{{([^}]+)}}/g;
    const placeholders: string[] = [];
    let match;

    while ((match = regex.exec(content)) !== null) {
      if (!placeholders.includes(match[1])) {
        placeholders.push(match[1]);
      }
    }

    return placeholders;
  }

  // Get default templates
  getDefaultTemplates(): Omit<WhatsAppTemplate, 'id' | 'createdBy' | 'createdAt'>[] {
    return [
      {
        name: 'Property Details Share',
        content: 'Hi {{lead_name}}! 👋\n\nI wanted to share details about the {{property_type}} property we discussed:\n\n📍 Location: {{property_location}}\n💰 Price: {{property_price}}\n🏠 Features: {{property_features}}\n\nWould you like to schedule a viewing? Let me know what works best for you!\n\nBest regards,\n{{agent_name}}',
        category: 'property-share',
        placeholders: ['lead_name', 'property_type', 'property_location', 'property_price', 'property_features', 'agent_name'],
        isActive: true,
      },
      {
        name: 'Follow-up Message',
        content: 'Hello {{lead_name}}! 👋\n\nI hope you\'re doing well. I wanted to follow up on our previous conversation about your {{property_type}} requirements.\n\nHave you had a chance to think about the properties I shared? I\'d love to help you find the perfect match!\n\nFeel free to call me at {{agent_phone}} or reply here.\n\nBest regards,\n{{agent_name}}',
        category: 'follow-up',
        placeholders: ['lead_name', 'property_type', 'agent_phone', 'agent_name'],
        isActive: true,
      },
      {
        name: 'Meeting Confirmation',
        content: 'Hi {{lead_name}}! 📅\n\nThis is to confirm our meeting scheduled for {{meeting_date}} at {{meeting_time}}.\n\n📍 Location: {{meeting_location}}\n\nPlease let me know if you need to reschedule or have any questions.\n\nLooking forward to meeting you!\n\n{{agent_name}}',
        category: 'meeting',
        placeholders: ['lead_name', 'meeting_date', 'meeting_time', 'meeting_location', 'agent_name'],
        isActive: true,
      },
      {
        name: 'Thank You After Visit',
        content: 'Hi {{lead_name}}! 🙏\n\nThank you for taking the time to visit the {{property_type}} property today. I hope you liked what you saw!\n\nIf you have any questions or would like to see more properties, please don\'t hesitate to reach out.\n\nI\'m here to help you find your dream home! 🏡\n\nBest regards,\n{{agent_name}}',
        category: 'thank-you',
        placeholders: ['lead_name', 'property_type', 'agent_name'],
        isActive: true,
      },
    ];
  }
}