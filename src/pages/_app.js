import React from 'react';
import PropTypes from 'prop-types';
import Theme from '@codeday/topo/Theme';

export default function App({ Component, pageProps }) {
  return (
    <Theme brandColor="red">
      <style type="text/css">{`
      html { font-size: 3vh; background-color: #fff; color: #fff; }
    `}</style>
      <Component {...pageProps} />
    </Theme>
  );
}
App.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object,
};
App.defaultProps = {
  pageProps: {},
};
