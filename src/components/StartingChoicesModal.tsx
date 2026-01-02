import { useState } from 'react';
import { STARTING_CHOICES } from '../data';

interface StartingChoicesModalProps {
  playerName: string;
  onConfirm: (choiceIndex: number) => void;
}

export function StartingChoicesModal({
  playerName,
  onConfirm,
}: StartingChoicesModalProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleConfirm = () => {
    if (selectedIndex !== null) {
      onConfirm(selectedIndex);
      setSelectedIndex(null);
    }
  };

  return (
    <div className="modal" style={{ display: 'block' }}>
      <div className="modal-content">
        <h2 className="modal-title">Choose Your Starting Resources</h2>
        <p>
          <strong>{playerName}</strong>, select your starting advantage:
        </p>
        <div className="starting-cards">
          {STARTING_CHOICES.map((choice, index) => (
            <div
              key={choice.name}
              className={`starting-card ${selectedIndex === index ? 'selected' : ''}`}
              onClick={() => setSelectedIndex(index)}
            >
              <div className="card-title">{choice.name}</div>
              <div style={{ marginBottom: '10px' }}>{choice.description}</div>
              <div>
                <strong>Rewards:</strong>
              </div>
              <div>• Gold: +{choice.rewards.gold}</div>
              <div>• Influence: +{choice.rewards.political_influence}</div>
              {choice.rewards.buildings && (
                <div>• Building: {choice.rewards.buildings[0]}</div>
              )}
              {choice.rewards.henchman_cards && (
                <div>• Henchman Cards: {choice.rewards.henchman_cards}</div>
              )}
            </div>
          ))}
        </div>
        <button
          className="btn btn-primary"
          disabled={selectedIndex === null}
          onClick={handleConfirm}
        >
          Confirm Choice
        </button>
      </div>
    </div>
  );
}
