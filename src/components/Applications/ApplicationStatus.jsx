import React from 'react';

export default function ApplicationStatus({ status }) {
  let badgeProps = { bg: 'var(--primary-light)', color: 'var(--primary)', text: status, icon: '🔵' };

  if (status === 'submitted' || status === 'new' || status === 'New') {
    badgeProps = { bg: '#fef9c3', color: '#854d0e', text: 'New', icon: '🟡' };
  } else if (status === 'Approved' || status === 'approved') {
    badgeProps = { bg: 'var(--success-bg)', color: 'var(--success)', text: 'Approved', icon: '🟢' };
  } else if (status === 'Pending' || status === 'Pending Uploads' || status === 'pending') {
    badgeProps = { bg: '#fffbeb', color: '#b45309', text: 'Pending Uploads', icon: '🟡' };
  } else if (status === 'under_review' || status === 'Under Review') {
    badgeProps = { bg: '#eff6ff', color: '#1d4ed8', text: 'Under Review', icon: '🔵' };
  } else if (status === 'documents_verified') {
    badgeProps = { bg: '#f5f3ff', color: '#7c3aed', text: 'Docs Verified', icon: '🟣' };
  } else if (status === 'site_visit_completed') {
    badgeProps = { bg: '#ecfdf5', color: '#059669', text: 'Visit Done', icon: '🟢' };
  } else if (status === 'Rejected' || status === 'rejected') {
    badgeProps = { bg: 'var(--danger-bg)', color: 'var(--danger)', text: 'Rejected', icon: '🔴' };
  }

  return (
    <span style={{
      backgroundColor: badgeProps.bg,
      color: badgeProps.color,
      padding: '0.2rem 0.65rem',
      borderRadius: 'var(--radius-full)',
      fontSize: '0.75rem',
      fontWeight: 700,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.3rem',
      whiteSpace: 'nowrap'
    }}>
      <span>{badgeProps.icon}</span> {badgeProps.text}
    </span>
  );
}
