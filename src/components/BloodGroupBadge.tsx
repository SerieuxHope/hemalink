import React from 'react';

interface BloodGroupBadgeProps {
  group: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'critical' | 'subtle';
}

export const BloodGroupBadge: React.FC<BloodGroupBadgeProps> = ({
  group,
  size = 'md',
  variant = 'default',
}) => {
  const sizeClass = size === 'lg' ? 'blood-pill-lg' : '';
  const variantClass = variant === 'critical' ? 'blood-pill-critical' : variant === 'subtle' ? 'blood-pill-subtle' : '';

  return (
    <span className={`blood-pill ${sizeClass} ${variantClass}`} title={`Blood Group: ${group}`}>
      {group}
    </span>
  );
};
