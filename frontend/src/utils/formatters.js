export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const formatDuration = (seconds) => {
  if (!seconds || seconds <= 0) return '0s';
  const mins = Math.floor(seconds / 60);
  const remainingSecs = seconds % 60;
  if (mins === 0) return `${remainingSecs}s`;
  return `${mins}m ${remainingSecs}s`;
};

export const getDifficultyColor = (level) => {
  switch (level?.toLowerCase()) {
    case 'beginner':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'intermediate':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'advanced':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

export const getRoleBadge = (role) => {
  switch (role?.toLowerCase()) {
    case 'admin':
      return { label: 'Administrator', color: 'bg-rose-50 text-rose-700 border-rose-200' };
    case 'instructor':
      return { label: 'Instructor', color: 'bg-purple-50 text-purple-700 border-purple-200' };
    case 'learner':
    default:
      return { label: 'Learner', color: 'bg-blue-50 text-blue-700 border-blue-200' };
  }
};
