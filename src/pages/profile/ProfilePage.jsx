import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Alert, Button, Card, CardHeader, Input, Select } from '../../components/ui';
import { MsIcon } from '../../components/ui/MsIcon';
import { useToast } from '../../components/ui/Toast';
import { selectUser } from '../../features/auth/authSlice';
import { useUpdateMeMutation } from '../../features/user/userApi';
import { useResendVerificationMutation } from '../../features/auth/authApi';
import { CURRENCIES, DATE_FORMATS, LANGUAGES, TIMEZONES } from '../../constants';
import { initials } from '../../utils/format';
import { NotificationPrefs } from '../../components/notifications/NotificationPrefs';

const MAX_AVATAR_BYTES = 280 * 1024;

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  bio: '',
  timezone: 'UTC',
  currency: 'USD',
  language: 'en',
  dateFormat: 'MMM d, yyyy',
  avatarUrl: '',
};

function formFromUser(user) {
  if (!user) return emptyForm;
  return {
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    phone: user.phone || '',
    bio: user.bio || '',
    timezone: user.timezone || 'UTC',
    currency: user.currency || 'USD',
    language: user.language || 'en',
    dateFormat: user.dateFormat || 'MMM d, yyyy',
    avatarUrl: user.avatarUrl || '',
  };
}

export function ProfilePage() {
  const user = useSelector(selectUser);
  const { push } = useToast();
  const fileRef = useRef(null);
  const [updateMe, { isLoading }] = useUpdateMeMutation();
  const [resendVerification, { isLoading: sendingVerify }] = useResendVerificationMutation();
  const [form, setForm] = useState(() => formFromUser(user));
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(formFromUser(user));
  }, [user]);

  const zones = TIMEZONES.includes(form.timezone) ? TIMEZONES : [form.timezone, ...TIMEZONES];

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function onPhoto(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Choose a JPG, PNG, or WebP photo.');
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setError('Keep the photo under 280 KB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({ ...current, avatarUrl: String(reader.result || '') }));
    };
    reader.readAsDataURL(file);
  }

  async function save(event) {
    event.preventDefault();
    setError('');
    try {
      await updateMe(form).unwrap();
      push({ tone: 'success', title: 'Profile updated' });
    } catch (err) {
      setError(err?.data?.errors?.[0]?.message || err?.data?.message || 'Unable to save profile');
    }
  }

  return (
    <div className="st-page profile-page">
      <header className="page-hero">
        <p className="page-kicker">Account</p>
        <h1 className="st-page-title">Profile</h1>
        <p className="page-lead">Name, photo, and regional defaults for this workspace.</p>
      </header>

      {!user?.emailVerified ? (
        <Alert tone="warning" title="Confirm your email">
          Verify {user?.email} so password and PIN recovery stay available.
          <div style={{ marginTop: 10 }}>
            <Button size="sm" variant="secondary" loading={sendingVerify} onClick={() => resendVerification()}>
              Resend verification
            </Button>
          </div>
        </Alert>
      ) : null}

      <form className="profile-form" onSubmit={save}>
        <div className="profile-layout">
          <Card className="profile-identity">
            <CardHeader title="Identity" subtitle="How you appear across Aether." />
            <div className="profile-identity-body">
              <div className="profile-avatar-col">
                <button
                  type="button"
                  className="profile-avatar"
                  onClick={() => fileRef.current?.click()}
                  aria-label="Change profile photo"
                >
                  {form.avatarUrl ? (
                    <img src={form.avatarUrl} alt="" />
                  ) : (
                    <span>{initials(user?.name || 'A')}</span>
                  )}
                  <em>
                    <MsIcon name="photo_camera" filled />
                    Change
                  </em>
                </button>
                <button type="button" className="st-btn-ghost" onClick={() => fileRef.current?.click()}>
                  Upload new
                </button>
                <p className="field-hint">JPG, PNG, or WebP · 280 KB max</p>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={onPhoto} />
              </div>

              <div className="profile-fields">
                {error ? <Alert tone="danger">{error}</Alert> : null}
                <div className="field-row">
                  <Input
                    label="First name"
                    name="firstName"
                    value={form.firstName}
                    onChange={updateField}
                    required
                    placeholder="Ayan"
                    autoComplete="given-name"
                  />
                  <Input
                    label="Last name"
                    name="lastName"
                    value={form.lastName}
                    onChange={updateField}
                    required
                    placeholder="Habib"
                    autoComplete="family-name"
                  />
                </div>
                <Input
                  label="Email address"
                  value={form.email}
                  readOnly
                  hint="Email is locked to this account."
                  rightSlot={<MsIcon name="lock" />}
                />
                <Input
                  label="Phone number"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={updateField}
                  placeholder="+92 300 0000000"
                  autoComplete="tel"
                />
                <label className="field" htmlFor="profile-bio">
                  <span className="field-label">Professional bio</span>
                  <span className="field-control profile-bio-wrap">
                    <textarea
                      id="profile-bio"
                      name="bio"
                      rows="3"
                      maxLength={280}
                      value={form.bio}
                      onChange={updateField}
                      placeholder="A short professional bio"
                    />
                  </span>
                  <span className="field-hint">{form.bio.length}/280</span>
                </label>
              </div>
            </div>
          </Card>

          <Card className="profile-regional">
            <CardHeader title="Regional" subtitle="Formats used on money, reports, and dates." />
            <div className="profile-fields">
              <Select name="timezone" label="Timezone" value={form.timezone} onChange={updateField}>
                {zones.map((zone) => (
                  <option key={zone} value={zone}>{zone.replace(/_/g, ' ')}</option>
                ))}
              </Select>
              <Select name="language" label="Language" value={form.language} onChange={updateField}>
                {LANGUAGES.map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </Select>
              <Select name="dateFormat" label="Date format" value={form.dateFormat} onChange={updateField}>
                {DATE_FORMATS.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </Select>
              <Select name="currency" label="Primary currency" value={form.currency} onChange={updateField}>
                {CURRENCIES.map((code) => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </Select>
            </div>
          </Card>
        </div>

        <div className="profile-actions">
          <Button type="button" variant="ghost" onClick={() => { setForm(formFromUser(user)); setError(''); }}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}>Save profile</Button>
        </div>
      </form>

      <NotificationPrefs />
    </div>
  );
}
