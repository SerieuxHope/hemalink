import React from 'react';

interface LoadingSkeletonProps {
  rows?: number;
  height?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  rows = 3,
  height = '40px',
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{
            height,
            width: i === rows - 1 ? '75%' : '100%',
          }}
        />
      ))}
    </div>
  );
};
