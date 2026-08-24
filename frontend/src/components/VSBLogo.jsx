import React from 'react';
import CollegeLogo from './CollegeLogo.jsx';

export default function VSBLogo({ size = 54, showTitle = true, lightTheme = false, subtitle = "KARUR – 639 111" }) {
  return (
    <CollegeLogo
      size={size}
      showTitle={showTitle}
      lightTheme={lightTheme}
      subtitle={subtitle}
    />
  );
}
