import React from 'react';

// Razorpay payment handler
declare global {
  interface Window {
    Razorpay: any;
  }
}

export function useRazorpay() {
  const [isScriptLoaded, setIsScriptLoaded] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && !window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => setIsScriptLoaded(true);
      document.body.appendChild(script);
    } else if (window.Razorpay) {
      setIsScriptLoaded(true);
    }
  }, []);

  return isScriptLoaded;
}
