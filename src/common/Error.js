import React, { PropTypes } from 'react';

const Error = ({ closeErrorMessage, error }) => {
  if (error) {
    return (
        <div className="notification">
          <div className="notification--error">
            <div className="message">{error.message}</div>
            <button className="btn--close" onClick={() => closeErrorMessage()} >Close</button>
          </div>
        </div>);
  }
  return null;
};

Error.propTypes = {
  closeErrorMessage: PropTypes.func.isRequired,
  error: PropTypes.object,
};

export default Error;