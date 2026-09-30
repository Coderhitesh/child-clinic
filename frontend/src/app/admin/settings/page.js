'use client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import { websiteSettingApi } from '@/services';
import PageHeader from '@/components/admin/page-header';
import DynamicForm from '@/components/admin/dynamic-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner, PageLoader } from '@/components/ui/spinner';
import { getErr } from '@/lib/utils';

const fields = [
  { type: 'section', label: 'Identity' },
  { name: 'siteName', label: 'Site name', required: true },
  { name: 'tagline', label: 'Tagline' },
  { name: 'footerText', label: 'Footer text', type: 'textarea', rows: 2 },

  { type: 'section', label: 'Branding' },
  { name: 'branding.logoHeader', label: 'Header logo', type: 'image' },
  { name: 'branding.logoFooter', label: 'Footer logo', type: 'image' },
  { name: 'branding.logoMobile', label: 'Mobile logo', type: 'image' },
  { name: 'branding.logoDark', label: 'Logo for dark sections', type: 'image' },
  { name: 'branding.favicon', label: 'Favicon', type: 'image' },
  { name: 'branding.appleTouchIcon', label: 'Apple touch icon', type: 'image' },

  { type: 'section', label: 'Contact' },
  { name: 'contactEmail', label: 'Contact email', type: 'email' },
  { name: 'contactPhone', label: 'Contact phone' },
  { name: 'supportPhone', label: 'Support phone' },
  { name: 'address', label: 'Address', type: 'textarea', rows: 2 },
  { name: 'googleMapsEmbedUrl', label: 'Google Maps embed URL', help: 'The src from the Maps embed iframe.' },

  { type: 'section', label: 'Social' },
  { name: 'socialLinks.facebook', label: 'Facebook' },
  { name: 'socialLinks.instagram', label: 'Instagram' },
  { name: 'socialLinks.twitter', label: 'Twitter / X' },
  { name: 'socialLinks.youtube', label: 'YouTube' },
  { name: 'socialLinks.linkedin', label: 'LinkedIn' },
  { name: 'socialLinks.whatsapp', label: 'WhatsApp' },

  { type: 'section', label: 'Apps' },
  { name: 'playStoreUrl', label: 'Play Store URL' },
  { name: 'appStoreUrl', label: 'App Store URL' },

  { type: 'section', label: 'Default SEO' },
  { name: 'seo.metaTitle', label: 'Meta title' },
  { name: 'seo.metaDescription', label: 'Meta description', type: 'textarea', rows: 2 },
  { name: 'seo.metaKeywords', label: 'Meta keywords' },
  { name: 'seo.ogImage', label: 'Share image', type: 'image' },
  { name: 'seo.canonicalUrl', label: 'Canonical URL' },
  { name: 'seo.robots', label: 'Robots', type: 'select', options: ['index,follow', 'noindex,follow', 'index,nofollow', 'noindex,nofollow'].map((v) => ({ value: v, label: v })) },
];

export default function SettingsPage() {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    websiteSettingApi.get()
      .then((d) => setForm(d || { branding: {}, socialLinks: {}, seo: {} }))
      .catch((e) => { toast.error(getErr(e)); setForm({ branding: {}, socialLinks: {}, seo: {} }); });
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await websiteSettingApi.update(form);
      toast.success('Website settings saved');
    } catch (e) { toast.error(getErr(e)); } finally { setSaving(false); }
  };

  if (!form) return <PageLoader />;

  return (
    <>
      <PageHeader
        title="Website settings"
        sub="One record that drives the header, footer, contact details and default SEO across the site."
        actions={<Button onClick={save} disabled={saving}>{saving ? <Spinner /> : <Save className="h-4 w-4" />}Save</Button>}
      />

      <Card>
        <CardContent className="p-5">
          <DynamicForm fields={fields} value={form} onChange={setForm} />
        </CardContent>
      </Card>

      <div className="mt-5 flex justify-end">
        <Button onClick={save} disabled={saving}>{saving ? <Spinner /> : <Save className="h-4 w-4" />}Save settings</Button>
      </div>
    </>
  );
}
