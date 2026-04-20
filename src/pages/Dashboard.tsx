import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Video, Mic } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import SOSButton from '@/components/sos/SOSButton';
import IdentityCard from '@/components/identity/IdentityCard';
import WeatherPlaceholder from '@/components/safety/WeatherPlaceholder';
import GeofencePlaceholder from '@/components/safety/GeofencePlaceholder';
import SafePlacesFinder from '@/components/safety/SafePlacesFinder';
import TravelTimeline from '@/components/timeline/TravelTimeline';
import EmergencyContacts from '@/components/profile/EmergencyContacts';
import UploadPopup from '@/components/identity/UploadPopup';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';

import { toast } from 'sonner';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user, loading, uploadId } = useAuth();
  const navigate = useNavigate();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  const [locationOn, setLocationOn] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showFirstUpload, setShowFirstUpload] = useState(false);
  const [uploadMode, setUploadMode] = useState<'id' | 'passport'>('id');
  const [activeTab, setActiveTab] = useState('home');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [micPermission, setMicPermission] = useState<boolean | null>(null);
  const [passportLoading, setPassportLoading] = useState(false);
  const [passportName, setPassportName] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [passportHash, setPassportHash] = useState('');

  useEffect(() => {
    if (loading) return; // Wait for auth to finish loading
    if (!user) { navigate('/login'); return; }
    if (user.isAdmin) { navigate('/authority'); return; }
    if (!user.idUploaded) setShowFirstUpload(true);
    checkLocation();
    checkDevices();
  }, [user, loading, navigate]);

  const checkLocation = () => {
    navigator.geolocation?.getCurrentPosition(() => setLocationOn(true), () => setLocationOn(false));
  };

  const checkDevices = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach(track => track.stop());
      setCameraPermission(true);
      setMicPermission(true);
    } catch {
      // Check individual permissions
      try {
        const camStream = await navigator.mediaDevices.getUserMedia({ video: true });
        camStream.getTracks().forEach(track => track.stop());
        setCameraPermission(true);
      } catch { setCameraPermission(false); }
      try {
        const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStream.getTracks().forEach(track => track.stop());
        setMicPermission(true);
      } catch { setMicPermission(false); }
    }
  };

  const handleRequestLocation = () => {
    // Show loading spinner while auth is initializing
    checkLocation();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }
  const handleRequestCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setCameraPermission(true);
    } catch { toast.error(t('pls_allow_settings') || 'Please allow camera in site settings'); }
  };
  const handleRequestMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setMicPermission(true);
    } catch { toast.error(t('pls_allow_settings') || 'Please allow mic in site settings'); }
  };

  const handleAgree = () => {
    setUploadMode('id');
    setShowFirstUpload(false);
    setShowUpload(false);
    fileInputRef.current?.click();
  };

  const handlePassportUploadClick = () => {
    setUploadMode('passport');
    setShowUpload(false);
    fileInputRef.current?.click();
  };

  const generateSha256 = async (value: string) => {
    const bytes = new TextEncoder().encode(value);
    const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(hashBuffer))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (uploadMode === 'id') {
      uploadId();
      toast.success('ID uploaded & Blockchain ID generated!');
      e.target.value = '';
      return;
    }

    setPassportLoading(true);
    setPassportHash('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('doc_type', 'passport');

      const response = await fetch(`${apiBaseUrl}/api/ocr`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Passport OCR failed');
      }

      const name = (data?.name || '').toString().trim();
      const idNumber = (data?.id_number || '').toString().trim();

      if (!name || !idNumber) {
        throw new Error('Could not extract passport name and number');
      }

      setPassportName(name);
      setPassportNumber(idNumber);
      setPassportHash(await generateSha256(`${name}-${idNumber}`));

      toast.success('Document analyzed and secure ID generated.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to process passport';
      toast.error(message);
    } finally {
      setPassportLoading(false);
      e.target.value = '';
    }
  };

  const handleGeneratePassportHash = async () => {
    if (!passportName || !passportNumber) {
      toast.error('Please upload a passport first so name and ID can be extracted.');
      return;
    }

    const hash = await generateSha256(`${passportName}-${passportNumber}`);
    setPassportHash(hash);
    toast.success('Hash ID generated successfully');
  };

  const card = (i: number, children: React.ReactNode) => (
    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
      {children}
    </motion.div>
  );

  const tabContent: Record<string, React.ReactNode> = {
    home: (
      <div className="space-y-4 md:space-y-6">
        {card(0, <IdentityCard onUpload={() => { setUploadMode('id'); setShowUpload(true); }} />)}
        {card(1,
          <div className="flex items-center justify-center py-6">
            <SOSButton />
          </div>
        )}
        {card(2, <EmergencyContacts />)}
        {card(3,
          <section className="rounded-2xl border bg-card text-card-foreground shadow-sm p-4 md:p-5 space-y-3">
            <div>
              <h2 className="text-base md:text-lg font-semibold">Generate Secure ID</h2>
              <p className="text-sm text-muted-foreground">Upload your passport to fetch your name and ID for secure ID generation.</p>
            </div>
            <button
              type="button"
              onClick={handlePassportUploadClick}
              disabled={passportLoading}
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              {passportLoading ? 'Analyzing Document...' : 'Upload Document'}
            </button>
          </section>
        )}
        {card(4,
          <section className="rounded-2xl border bg-card text-card-foreground shadow-sm p-4 md:p-5 space-y-3">
            <div>
              <h2 className="text-base md:text-lg font-semibold">Fetched Passport Details</h2>
              <p className="text-sm text-muted-foreground">Only extracted name and ID are shown here.</p>
            </div>
            <div className="rounded-xl bg-muted/40 border p-3 space-y-1 text-sm">
              <p><span className="font-semibold">Name:</span> {passportName || '—'}</p>
              <p><span className="font-semibold">ID:</span> {passportNumber || '—'}</p>
            </div>
          </section>
        )}
        {card(5,
          <section className="rounded-2xl border-2 border-primary/40 bg-card text-card-foreground shadow-sm p-4 md:p-5 space-y-3">
            <div>
              <h2 className="text-base md:text-lg font-semibold">Generate My ID</h2>
              <p className="text-sm text-muted-foreground">Create and verify your secure ID from the fetched name and passport ID.</p>
            </div>
            <button
              type="button"
              onClick={handleGeneratePassportHash}
              disabled={passportLoading || !passportName || !passportNumber}
              className="w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              Generate My ID
            </button>
            <div className="rounded-xl bg-muted/40 border p-3 text-sm space-y-1">
              <p className="font-semibold">Generated Secure ID</p>
              <p className="break-all font-mono text-xs md:text-sm">{passportHash || 'Not generated yet'}</p>
            </div>
          </section>
        )}
      </div>
    ),
    safety: (
      <div className="space-y-4 md:space-y-6">
        {card(0, <SafePlacesFinder />)}
      </div>
    ),
    tracking: (
      <div className="space-y-4 md:space-y-6">
        {card(0, <TravelTimeline />)}
      </div>
    ),
    geofence: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {card(0, <GeofencePlaceholder />)}
        {card(1, <WeatherPlaceholder />)}
      </div>
    ),
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      {/* Desktop tabs now in Navbar — only mobile BottomNav below */}
      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
      <UploadPopup
        open={showFirstUpload || showUpload}
        onAgree={handleAgree}
        onLater={() => { setShowFirstUpload(false); setShowUpload(false); }}
      />

      <main className="container max-w-lg md:max-w-3xl lg:max-w-5xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-6 pb-24 flex-1">
        {/* Permission Status Banners */}
        <div className="space-y-2">
          {card(0,
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${locationOn ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
              <MapPin size={18} />
              {locationOn ? t('location_on') : t('location_off')}
              {!locationOn && <button onClick={handleRequestLocation} className="ml-auto px-3 py-1 bg-background text-foreground rounded text-xs font-bold shadow-sm">Enable</button>}
            </div>
          )}
          {cameraPermission !== null && card(1,
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${cameraPermission ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
              <Video size={18} />
              {cameraPermission ? (t('camera_permission_granted') || 'Camera permission granted') : (t('camera_permission_denied') || 'Camera permission not granted')}
              {!cameraPermission && <button onClick={handleRequestCamera} className="ml-auto px-3 py-1 bg-background text-foreground rounded text-xs font-bold shadow-sm">Enable</button>}
            </div>
          )}
          {micPermission !== null && card(2,
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${micPermission ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
              <Mic size={18} />
              {micPermission ? (t('mic_permission_granted') || 'Microphone permission granted') : (t('mic_permission_denied') || 'Microphone permission not granted')}
              {!micPermission && <button onClick={handleRequestMic} className="ml-auto px-3 py-1 bg-background text-foreground rounded text-xs font-bold shadow-sm">Enable</button>}
            </div>
          )}
        </div>

        {/* Tab Content — driven by bottom nav */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            {tabContent[activeTab]}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
      <BottomNav active={activeTab} onChange={setActiveTab} mobileOnly />
    </div>
  );
};

export default Dashboard;
