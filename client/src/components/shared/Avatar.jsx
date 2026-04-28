
const Avatar = ({ name, src, size = 'md', className = '' }) => {
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-20 h-20 text-2xl',
    xl: 'w-32 h-32 text-4xl',
  };

  const initials = getInitials(name);

  return (
    <div 
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden bg-gray-200 text-gray-600 font-semibold border-2 border-white shadow-sm ${sizeClasses[size]} ${className}`}
    >
      {src ? (
        <img 
          src={src.startsWith('http') ? src : `${import.meta.env.VITE_API_URL || ''}${src}`} 
          alt={name} 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '';
            e.target.parentElement.innerHTML = `<span class="text-gray-600">${initials}</span>`;
          }}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

export default Avatar;
