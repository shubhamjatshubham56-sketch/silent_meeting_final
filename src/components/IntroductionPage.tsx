import React, { useState } from 'react';
import { UserCheck, Play, Save, CheckCircle, RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';
import { GestureMapping, UserProfile } from '../types';

interface IntroductionPageProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  availableGestures: GestureMapping[];
  onTestIntroduction: (compiledText: string) => void;
}

export const IntroductionPage: React.FC<IntroductionPageProps> = ({
  profile,
  onUpdateProfile,
  availableGestures,
  onTestIntroduction,
}) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [isSaved, setIsSaved] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Filter out the 3 primary gestures to prevent interference
  const PRIMARY_GESTURE_IDS = ['thumbs_up', 'open_palm', 'victory'];
  const eligibleMacroGestures = availableGestures.filter(
    (g) => !PRIMARY_GESTURE_IDS.includes(g.id)
  );

  const compileTemplate = () => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return formData.template
      .replace('{name}', formData.name || 'User')
      .replace('{job_title}', formData.job_title || 'Team Member')
      .replace('{team}', formData.team || 'General')
      .replace('{status}', formData.status || 'Active')
      .replace('{organization}', formData.organization || 'Organization')
      .replace('{additional_info}', formData.additional_info || '')
      .replace('{time}', timeStr);
  };

  const compiledText = compileTemplate();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleGenerateAIIntro = async () => {
    setIsGeneratingAI(true);
    try {
      const res = await fetch('/api/gemini/generate-intro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          jobTitle: formData.job_title,
          team: formData.team,
          status: formData.status,
          style: 'Executive, polite, concise',
        }),
      });
      const data = await res.json();
      if (data.template) {
        setFormData((prev) => ({ ...prev, template: data.template }));
      }
    } catch (err) {
      console.warn('Could not generate AI intro:', err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div
      className="flex-1 h-full overflow-y-auto p-6 select-none"
      style={{ backgroundColor: '#07151D' }}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-[#123136] pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-[#F1F5F3] tracking-tight">
                Introduction & Silent Macro Profile
              </h1>
              <p className="text-xs text-[#9BAEAA] mt-1">
                Configure your professional introduction template. When triggered via master gesture, this is broadcast silently to the meeting video feed.
              </p>
            </div>
            <button
              type="button"
              onClick={handleGenerateAIIntro}
              disabled={isGeneratingAI}
              className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>{isGeneratingAI ? 'Generating...' : 'Gemini AI Polish'}</span>
            </button>
          </div>
        </div>

        {/* Protection Notice */}
        <div className="px-3.5 py-2.5 rounded-xl border border-emerald-500/25 bg-[#081F22] flex items-center gap-2.5 text-xs text-emerald-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Gesture Isolation Active:</strong> Primary gestures (Thumbs Up, Open Palm, Victory) are protected and will never trigger the introduction macro.
          </span>
        </div>

        {/* Live Preview Card */}
        <div className="p-4 rounded-xl border bg-[#0A1E25] border-[#1F8F68] shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[#2AA879] uppercase tracking-wider">
              Live Compiled Introduction Broadcast
            </span>
            <button
              onClick={() => onTestIntroduction(compiledText)}
              className="px-3 py-1.5 rounded-lg bg-[#1F8F68] hover:bg-[#2AA879] text-[#F1F5F3] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Test Introduction Gesture</span>
            </button>
          </div>
          <div className="p-3.5 rounded-lg bg-[#0D2528] border border-[#123136] text-sm font-semibold text-[#F1F5F3] leading-relaxed">
            "{compiledText}"
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-[#9BAEAA] mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#0A1E25] border border-[#123136] text-[#F1F5F3] focus:outline-hidden focus:border-[#1F8F68]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#9BAEAA] mb-1">
                Role / Job Title
              </label>
              <input
                type="text"
                value={formData.job_title}
                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#0A1E25] border border-[#123136] text-[#F1F5F3] focus:outline-hidden focus:border-[#1F8F68]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#9BAEAA] mb-1">
                Department / Team
              </label>
              <input
                type="text"
                value={formData.team}
                onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#0A1E25] border border-[#123136] text-[#F1F5F3] focus:outline-hidden focus:border-[#1F8F68]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#9BAEAA] mb-1">
                Organization / Company
              </label>
              <input
                type="text"
                value={formData.organization || ''}
                placeholder="Acme Corp"
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#0A1E25] border border-[#123136] text-[#F1F5F3] focus:outline-hidden focus:border-[#1F8F68]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#9BAEAA] mb-1">
                Status Message
              </label>
              <input
                type="text"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#0A1E25] border border-[#123136] text-[#F1F5F3] focus:outline-hidden focus:border-[#1F8F68]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#9BAEAA] mb-1">
                Master Macro Gesture Trigger
              </label>
              <select
                value={formData.master_gesture}
                onChange={(e) => setFormData({ ...formData, master_gesture: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#0A1E25] border border-[#123136] text-[#F1F5F3] focus:outline-hidden focus:border-[#1F8F68]"
              >
                {eligibleMacroGestures.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.label} ({g.category})
                  </option>
                ))}
                <option value="call_me">Call Me / Shaka (Recommended Macro)</option>
              </select>
            </div>
          </div>

          {/* Template Editor */}
          <div className="text-xs">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-[#9BAEAA]">
                Introduction Macro Template
              </label>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    template:
                      "👋 Hi everyone! I'm {name}, {job_title} ({team}). Currently status: {status} at {time}.",
                  }))
                }
                className="text-[10px] text-[#2AA879] hover:underline"
              >
                Reset to Standard Template
              </button>
            </div>
            <textarea
              rows={3}
              value={formData.template}
              onChange={(e) => setFormData({ ...formData, template: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[#0A1E25] border border-[#123136] text-[#F1F5F3] focus:outline-hidden focus:border-[#1F8F68] font-mono text-xs"
            />
            <span className="text-[10px] text-[#6F827E] mt-1 block">
              Available tags: {'{name}'}, {'{job_title}'}, {'{team}'}, {'{organization}'}, {'{status}'}, {'{time}'}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2">
            {isSaved ? (
              <div className="flex items-center gap-1.5 text-xs text-[#2AA879] font-semibold">
                <CheckCircle className="w-4 h-4" />
                <span>Profile saved successfully</span>
              </div>
            ) : <span />}

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#1F8F68] hover:bg-[#2AA879] text-[#F1F5F3] text-xs font-semibold flex items-center gap-2 transition-colors shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
