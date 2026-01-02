import { useState } from 'react';
import { ROLES } from '../data';

interface RoleSelectionModalProps {
  playerName: string;
  availableRoles: string[];
  onConfirm: (roleId: string) => void;
}

export function RoleSelectionModal({
  playerName,
  availableRoles,
  onConfirm,
}: RoleSelectionModalProps) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleConfirm = () => {
    if (selectedRole) {
      onConfirm(selectedRole);
      setSelectedRole(null);
    }
  };

  return (
    <div className="modal" style={{ display: 'block' }}>
      <div className="modal-content">
        <h2 className="modal-title">Select Your Role</h2>
        <p>
          <strong>{playerName}</strong>, choose your role for this round:
        </p>
        <div className="roles-grid">
          {Object.entries(ROLES).map(([roleId, role]) => {
            if (roleId === 'mayor') return null;
            const isAvailable = availableRoles.includes(roleId);
            const isSelected = selectedRole === roleId;

            return (
              <div
                key={roleId}
                className={`role-card ${isSelected ? 'selected' : ''} ${!isAvailable ? 'taken' : ''}`}
                onClick={() => isAvailable && setSelectedRole(roleId)}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                  {role.name}
                </div>
                <div style={{ fontSize: '0.9rem' }}>{role.description}</div>
              </div>
            );
          })}
        </div>
        <button
          className="btn btn-primary"
          disabled={!selectedRole}
          onClick={handleConfirm}
        >
          Confirm Selection
        </button>
      </div>
    </div>
  );
}
