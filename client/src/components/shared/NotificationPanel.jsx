import { X, CheckCircle, Info, AlertTriangle, Clock } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const NotificationPanel = ({ isOpen, onClose }) => {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();

  if (!isOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'MEDIA_APPROVED': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'MEDIA_PENDING': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'PROFILE_UPDATED': return <Info className="w-5 h-5 text-blue-500" />;
      case 'NEW_MEMBER_ENROLLED': return <CheckCircle className="w-5 h-5 text-indigo-500" />;
      default: return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                {unreadCount} new
              </span>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {unreadCount > 0 && (
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex justify-end">
            <button 
              onClick={markAllAsRead}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
            >
              Mark all as read
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-500">
              <Clock className="w-12 h-12 mb-3 text-gray-300" />
              <p className="text-sm">You have no notifications right now.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 transition-colors hover:bg-gray-50 ${!notification.isRead ? 'bg-indigo-50/50' : ''}`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                        {notification.message}
                      </p>
                      {notification.relatedPersonId && (
                        <p className="mt-1 text-xs text-gray-500 line-clamp-1">
                          Related Profile ID: {notification.relatedPersonId}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-gray-400">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="w-2 h-2 rounded-full bg-indigo-600"
                          title="Mark as read"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationPanel;
