import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useState } from 'react';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import QrCode2Icon from '@mui/icons-material/QrCode2';

export default function AlertDialog() {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <a href='#' onClick={handleClickOpen} className="support-link">
        <VolunteerActivismIcon sx={{ fontSize: 20, marginRight: 0.5 }} />
        Support Us
      </a>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: '20px',
            padding: '1rem',
            maxWidth: '450px'
          }
        }}
      >
        <DialogTitle id="alert-dialog-title" sx={{ 
          textAlign: 'center',
          fontSize: '1.75rem',
          fontWeight: 700,
          background: 'linear-gradient(135deg, #10b981, #6366f1)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          paddingBottom: '0.5rem'
        }}>
          <VolunteerActivismIcon sx={{ fontSize: 40, color: '#10b981', marginBottom: 1 }} />
          <div>Support Our Mission</div>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', paddingTop: '1.5rem' }}>
          <DialogContentText id="alert-dialog-description" sx={{ 
            marginBottom: '1.5rem',
            color: '#6b7280',
            fontSize: '1rem',
            lineHeight: 1.6
          }}>
            Help us make a difference in the community. Your support enables us to address more issues and create positive change.
          </DialogContentText>
          <div className="qrcode-modern">
            <div className="qr-code-container">
              <QrCode2Icon sx={{ fontSize: 32, color: '#10b981', marginBottom: 1 }} />
              <img src="./../../qrcode.jpg" alt="Donation QR Code" />
              <p className="qr-instruction">Scan to donate</p>
            </div>
            <div className="donation-info">
              <p className="donation-text">
                <span className="donation-icon">💚</span>
                Every contribution counts
              </p>
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', paddingBottom: '1rem' }}>
          <Button 
            onClick={handleClose} 
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              padding: '0.75rem 2rem',
              borderRadius: '12px',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669, #10b981)',
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.5)'
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
