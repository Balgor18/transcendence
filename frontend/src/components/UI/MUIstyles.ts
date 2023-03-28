export const modalDialog = {
  width: 'auto',
  maxWidth: '442px',
  border: '0px solid #000',
  bgcolor: 'whitesmoke',
  borderRadius: '4px',
  paddingBottom: '30px',
};

export const modalHeader = {
  textTransform: 'uppercase',
  fontSize: '1.2rem',
  letterSpacing: '0.02857em',
  textAlign: 'center',
  fontWeight: 'bold'
};

export const modalClose = {
  position: 'absolute',
  top: 'calc(-1/4 * var(--IconButton-size))',
  right: 'calc(-1/4 * var(--IconButton-size))',
  boxShadow: '0 2px 12px 0 rgba(0 0 0 / 0.2)',
  borderRadius: '50%',
  bgcolor: 'whitesmoke',
  transition: 'background-color 0.3s ease-in-out',
  ':hover': {
    bgcolor: 'rgba(37, 120, 204, 0.5)'
  }
};
