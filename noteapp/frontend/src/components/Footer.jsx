import React from 'react';

const Footer = () => {
  const footerStyle = {
    color: 'green',
    fontStyle: 'italic',
    fontSize: 16,
    marginTop: 20,
    borderTop: '1px solid #ccc',
    paddingTop: 10,
  };

  return (
    <div style={footerStyle}>
      <br />
      <em>Note app, Department of Computer Science 2025</em>
    </div>
  );
};

export default Footer;
