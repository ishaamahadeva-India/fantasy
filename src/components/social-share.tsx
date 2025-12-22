'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Share2,
  MessageCircle,
  Facebook,
  Twitter,
  Link as LinkIcon,
  Copy,
  Check,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  imageUrl?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function SocialShare({
  url,
  title,
  description = '',
  imageUrl,
  className = '',
  variant = 'outline',
  size = 'default',
}: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Ensure URL is absolute
  const shareUrl = url.startsWith('http') ? url : `${typeof window !== 'undefined' ? window.location.origin : ''}${url}`;
  const shareTitle = encodeURIComponent(title);
  const shareDescription = encodeURIComponent(description || title);
  const shareImage = imageUrl ? encodeURIComponent(imageUrl) : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: 'Link Copied!',
        description: 'The link has been copied to your clipboard.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to Copy',
        description: 'Could not copy link to clipboard.',
      });
    }
  };

  const handleWhatsAppShare = () => {
    // WhatsApp Web API - includes image preview via Open Graph tags
    // The image will be shown automatically if Open Graph meta tags are set
    const whatsappText = `${title}${description ? `\n\n${description}` : ''}\n\n${shareUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
    window.open(whatsappUrl, '_blank', 'width=600,height=400');
  };

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const handleTwitterShare = () => {
    const twitterText = `${title}${description ? ` - ${description.substring(0, 100)}` : ''}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description || title,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled or error occurred
        console.log('Share cancelled');
      }
    } else {
      // Fallback to copy link
      handleCopyLink();
    }
  };

  // Note: Open Graph meta tags should be set at the page level for better SEO
  // This component handles the sharing UI, while pages set their own meta tags

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3">
        <div className="space-y-2">
          <div className="text-sm font-semibold mb-3">Share this</div>
          
          {/* WhatsApp Share */}
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleWhatsAppShare}
          >
            <MessageCircle className="w-4 h-4 mr-2 text-green-600" />
            WhatsApp
          </Button>

          {/* Facebook Share */}
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleFacebookShare}
          >
            <Facebook className="w-4 h-4 mr-2 text-blue-600" />
            Facebook
          </Button>

          {/* Twitter Share */}
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleTwitterShare}
          >
            <Twitter className="w-4 h-4 mr-2 text-blue-400" />
            Twitter
          </Button>

          {/* Native Share (Mobile) */}
          {typeof navigator !== 'undefined' && navigator.share && (
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleNativeShare}
            >
              <Share2 className="w-4 h-4 mr-2" />
              More Options
            </Button>
          )}

          {/* Copy Link */}
          <div className="pt-2 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleCopyLink}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </>
              )}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

