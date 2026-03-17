import { Alert, AlertTitle } from '@mui/material'
import React from 'react'
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import paymentService from '../../services/paymentService';
import toast from 'react-hot-toast';

const PaypalPayment = ({ totalPrice, onSuccess }) => {
  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
  const currency = paymentService.getCheckoutCurrency();

  if (!paypalClientId) {
    return (
      <div className='h-96 flex justify-center items-center'>
          <Alert severity="warning" variant='filled' style={{ maxWidth: "520px" }}>
              <AlertTitle>PayPal Key Missing</AlertTitle>
              Add VITE_PAYPAL_CLIENT_ID in your environment to enable PayPal checkout.
          </Alert>
      </div>
    )
  }

  return (
    <div className='max-w-xl mx-auto p-4'>
      <h2 className='text-xl font-semibold mb-4'>Pay with PayPal</h2>
      <PayPalScriptProvider options={{ clientId: paypalClientId, currency, intent: 'capture' }}>
        <PayPalButtons
          style={{ layout: 'vertical', shape: 'rect' }}
          createOrder={(data, actions) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: Number(totalPrice).toFixed(2),
                    currency_code: currency,
                  },
                },
              ],
            });
          }}
          onApprove={async (data, actions) => {
            const details = await actions.order.capture();
            toast.success('PayPal payment successful');
            await onSuccess({
              provider: 'PayPal',
              id: details?.id || data?.orderID || null,
              status: details?.status || 'COMPLETED',
              details,
            });
          }}
          onError={(error) => {
            const message = error?.message || 'PayPal payment failed. Please try again.';
            toast.error(message);
          }}
          onCancel={() => {
            toast('PayPal payment canceled');
          }}
        />
      </PayPalScriptProvider>
    </div>
  )
}

export default PaypalPayment