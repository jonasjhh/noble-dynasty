import { useState } from 'react';
import { POLICIES } from '../data';

interface PolicySelectionModalProps {
  mayorName: string;
  onConfirm: (policyId: string) => void;
}

export function PolicySelectionModal({
  mayorName,
  onConfirm,
}: PolicySelectionModalProps) {
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null);

  const handleConfirm = () => {
    if (selectedPolicy) {
      onConfirm(selectedPolicy);
      setSelectedPolicy(null);
    }
  };

  return (
    <div className="modal" style={{ display: 'block' }}>
      <div className="modal-content">
        <h2 className="modal-title">Select Policy for This Round</h2>
        <p>
          <strong>Mayor {mayorName}</strong>, choose the policy that will be in
          effect this round:
        </p>
        <div className="roles-grid">
          {Object.entries(POLICIES).map(([policyId, policy]) => {
            const isSelected = selectedPolicy === policyId;

            return (
              <div
                key={policyId}
                className={`role-card ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedPolicy(policyId)}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                  {policy.name}
                </div>
                <div style={{ fontSize: '0.9rem' }}>{policy.description}</div>
              </div>
            );
          })}
        </div>
        <button
          className="btn btn-primary"
          disabled={!selectedPolicy}
          onClick={handleConfirm}
        >
          Confirm Policy
        </button>
      </div>
    </div>
  );
}
