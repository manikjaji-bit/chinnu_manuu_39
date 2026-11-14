import React, { useState } from 'react';
import { InteractiveMap } from '../components/InteractiveMap';
import { ResolutionVerificationModal } from '../components/ResolutionVerificationModal';
import { Complaint } from '../types';

export const CampusMapView: React.FC = () => {
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const handleInspectComplaint = async (id: number) => {
    try {
      const res = await fetch(`/api/complaints/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedComplaint(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Map View */}
      <InteractiveMap onSelectComplaint={handleInspectComplaint} />

      {/* Verification Modal if inspected ticket has evidence */}
      {selectedComplaint && (
        <ResolutionVerificationModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          onSignoffSuccess={() => setSelectedComplaint(null)}
        />
      )}

    </div>
  );
};
