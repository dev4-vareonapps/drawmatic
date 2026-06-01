'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface OrganizationData {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
}

interface OrganizationSettingsFormProps {
  canEdit: boolean;
}

export function OrganizationSettingsForm({ canEdit }: OrganizationSettingsFormProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [slug, setSlug] = useState('');

  const loadOrganization = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/organizations');
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to load organization');
        return;
      }
      const org = data as OrganizationData;
      setName(org.name ?? '');
      setDescription(org.description ?? '');
      setLogoUrl(org.logoUrl ?? '');
      setSlug(org.slug ?? '');
    } catch {
      setError('Failed to load organization');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrganization();
  }, [loadOrganization]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canEdit) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/organizations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          logoUrl: logoUrl.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to save settings');
        return;
      }
      const org = data as OrganizationData;
      setName(org.name ?? name);
      setDescription(org.description ?? '');
      setLogoUrl(org.logoUrl ?? '');
      setSlug(org.slug ?? slug);
      setSuccess(true);
    } catch {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Card className="max-w-2xl">
        <CardContent className="py-8">
          <p className="text-sm text-muted-foreground">Loading organization...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Organization Settings</CardTitle>
        <CardDescription>
          {canEdit
            ? 'Update your organization profile. Only Super Admins can make changes.'
            : 'View your organization profile. Contact a Super Admin to make changes.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orgName">Organization Name</Label>
            <Input
              id="orgName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!canEdit || saving}
              required
              minLength={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="orgSlug">Slug</Label>
            <Input id="orgSlug" value={slug} disabled readOnly className="bg-muted" />
            <p className="text-xs text-muted-foreground">Slug cannot be changed here.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="orgDesc">Description</Label>
            <Textarea
              id="orgDesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={!canEdit || saving}
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="orgLogo">Logo URL</Label>
            <Input
              id="orgLogo"
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              disabled={!canEdit || saving}
              placeholder="https://example.com/logo.png"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && (
            <p className="text-sm text-green-600 dark:text-green-400">
              Settings saved successfully.
            </p>
          )}

          {canEdit && (
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
