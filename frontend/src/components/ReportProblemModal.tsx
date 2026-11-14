import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Upload, 
  Sparkles, 
  Camera, 
  MapPin, 
  Building2, 
  AlertTriangle, 
  CheckCircle2,
  Scan,
  Loader2
} from 'lucide-react';
import { Building, AIAnalysis } from '../types';
import { AIAnalysisCard } from './AIAnalysisCard';
import confetti from 'canvas-confetti';

interface ReportProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

export const ReportProblemModal: React.FC<ReportProblemModalProps> = ({ isOpen, onClose, onSubmitSuccess }) => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Plumbing');
  const [buildingId, setBuildingId] = useState<number>(1);
  const [floor, setFloor] = useState('1st Floor');
  const [room, setRoom] = useState('');
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [scanning, setScanning] = useState(false);
  const [aiPreview, setAiPreview] = useState<AIAnalysis | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    'Electrical',
    'Plumbing',
    'Infrastructure',
    'Sanitation',
    'Classroom equipment',
    'Water supply',
    'Safety',
    'Internet connectivity',
    'Other'
  ];

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const res = await fetch('/api/campus/buildings');
        if (res.ok) {
          const data = await res.json();
          setBuildings(data);
          if (data.length > 0) setBuildingId(data[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    };
    if (isOpen) {
      fetchBuildings();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setAiPreview(null);
    }
  };

  const handleRunAIScan = async () => {
    setScanning(true);
    try {
      const formData = new FormData();
      formData.append('title', title || 'Infrastructure defect');
      formData.append('description', description || 'Visible physical damage');
      formData.append('category', category);
      const bldg = buildings.find(b => b.id === buildingId);
      formData.append('building_name', bldg?.name || '');
      formData.append('room', room || '');
      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      const res = await fetch('/api/ai/analyze-image', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setAiPreview(data);
      }
    } catch (e) {
      console.error('Scan error:', e);
    } finally {
      setScanning(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !room) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('building_id', buildingId.toString());
      formData.append('floor', floor);
      formData.append('room', room);
      if (selectedFile) {
        formData.append('image_file', selectedFile);
      } else if (previewUrl) {
        formData.append('image_url', previewUrl);
      }

      const res = await fetch('/api/complaints/submit', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        // Trigger celebratory confetti for student contribution!
        try {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (_) {}

        onSubmitSuccess();
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border border-slate-700 shadow-2xl p-6 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="border-b border-slate-800 pb-4 pr-8">
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              <Camera className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Report Campus Issue</span>
          </div>
          <h3 className="text-xl font-bold text-white mt-1">Submit Infrastructure Problem</h3>
          <p className="text-xs text-slate-400">Our Vision AI will analyze the risk severity and automatically dispatch the appropriate repair team.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          
          {/* Photo Upload Zone */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Evidence Photograph</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-2xl p-4 text-center cursor-pointer bg-slate-950/40 hover:bg-slate-900/40 transition-all relative overflow-hidden"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {previewUrl ? (
                <div className="relative aspect-video max-h-48 rounded-xl overflow-hidden mx-auto">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-xs font-semibold text-white">
                    Click to choose different image
                  </div>
                </div>
              ) : (
                <div className="py-6 flex flex-col items-center justify-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 flex items-center justify-center shadow-lg shadow-cyan-950/50">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold text-slate-200">Click to upload photo of the problem</span>
                  <span className="text-[10px] text-slate-500">Supports JPG, PNG, WEBP (Max 10MB)</span>
                </div>
              )}
            </div>

            {/* AI Vision Pre-Scan Trigger Button */}
            {previewUrl && (
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleRunAIScan}
                  disabled={scanning}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-950 text-cyan-300 border border-cyan-800 hover:bg-cyan-900/50 text-xs font-semibold transition-all shadow-sm"
                >
                  {scanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Scan className="w-3.5 h-3.5" />}
                  <span>{scanning ? 'Running Vision Diagnostic...' : 'Pre-Scan with Vision AI'}</span>
                </button>
              </div>
            )}
          </div>

          {/* AI Diagnostic Scan Preview Card if generated */}
          {aiPreview && (
            <div className="animate-in fade-in duration-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block mb-1">Pre-Submission AI Diagnostic</span>
              <AIAnalysisCard analysis={aiPreview} />
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Problem Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Broken water pipe leaking near classroom ceiling"
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`p-2 rounded-xl text-xs font-medium border text-center transition-all ${
                    category === cat
                      ? 'bg-blue-600/30 border-cyan-400 text-white shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Campus Location: Building, Floor, Room */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Campus Building</label>
              <select
                value={buildingId}
                onChange={e => setBuildingId(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                {buildings.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Floor</label>
              <select
                value={floor}
                onChange={e => setFloor(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="Basement">Basement</option>
                <option value="Ground Floor">Ground Floor</option>
                <option value="1st Floor">1st Floor</option>
                <option value="2nd Floor">2nd Floor</option>
                <option value="3rd Floor">3rd Floor</option>
                <option value="4th Floor">4th Floor</option>
                <option value="Rooftop">Rooftop / Exterior</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Room / Specific Zone</label>
              <input
                type="text"
                value={room}
                onChange={e => setRoom(e.target.value)}
                placeholder="e.g. Room 204 or East Wing"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description & Safety Details</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe what you see, any water/electric proximity, strange sounds or burning smells..."
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Earn <span className="font-bold text-amber-400">+25 Impact Points</span> for verified safety hazard submissions
            </span>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-cyan-900/40 disabled:opacity-40 transition-all flex items-center space-x-1.5"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>{submitting ? 'Analyzing & Routing...' : 'Submit & Analyze'}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
