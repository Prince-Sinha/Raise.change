import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function Notification(){
    return (
        <div className="notification-modern-container">
            <div className="notification-header-modern">
                <h1 className="notification-title-gradient">
                    <NotificationsIcon sx={{ fontSize: 40, marginRight: 1 }} />
                    Notifications
                </h1>
            </div>

            <div className="notification-empty-state">
                <div className="notification-empty-icon">
                    <NotificationsNoneIcon sx={{ fontSize: 80, color: '#10b981' }} />
                </div>
                <h2 className="notification-empty-title">All Caught Up!</h2>
                <p className="notification-empty-text">
                    You don't have any notifications right now.<br />
                    Check back later for updates on your posts and community activity.
                </p>
                <div className="notification-features">
                    <div className="notification-feature-card">
                        <CheckCircleIcon sx={{ fontSize: 28, color: '#10b981' }} />
                        <span>Get notified when authorities respond</span>
                    </div>
                    <div className="notification-feature-card">
                        <CheckCircleIcon sx={{ fontSize: 28, color: '#10b981' }} />
                        <span>Track your issue status updates</span>
                    </div>
                    <div className="notification-feature-card">
                        <CheckCircleIcon sx={{ fontSize: 28, color: '#10b981' }} />
                        <span>Stay informed about community discussions</span>
                    </div>
                </div>
            </div>
        </div>
    );
}