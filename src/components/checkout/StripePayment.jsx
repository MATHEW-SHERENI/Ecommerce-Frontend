import { Alert, AlertTitle, Skeleton } from '@mui/material'
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import React, { useEffect, useState } from 'react'
import PaymentForm from './PaymentForm';
import paymentService from '../../services/paymentService';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const StripePayment = ({ totalPrice, address, onSuccess }) => {
  const [clientSecret, setClientSecret] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

  useEffect(() => {
    const createIntent = async () => {
      if (!totalPrice || Number(totalPrice) <= 0) return;
      setIsLoading(true);
      try {
        const intentPayload = {
          amount: Math.round(Number(totalPrice) * 100),
          currency: paymentService.getCheckoutCurrency().toLowerCase(),
          shippingAddress: address,
          description: `SmartCart order for ${formatAddressLine(address)}`,
        };
        const response = await paymentService.createStripePaymentIntent(intentPayload);
        const receivedClientSecret = response?.clientSecret || response?.data?.clientSecret;
        if (!receivedClientSecret) {
          throw new Error('Stripe client secret missing from payment intent response.');
        }
        setClientSecret(receivedClientSecret);
      } catch (error) {
        const message = error?.response?.data?.message || error?.message || 'Failed to initialize Stripe payment.';
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    createIntent();
  }, [address, totalPrice]);

  if (!stripePublishableKey) {
    return (
      <div className='max-w-xl mx-auto p-4'>
        <Alert severity="warning" variant='filled'>
          <AlertTitle>Stripe Key Missing</AlertTitle>
          Add VITE_STRIPE_PUBLISHABLE_KEY in your environment to enable Stripe checkout.
        </Alert>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className='max-w-lg mx-auto'>
        <Skeleton />
      </div>
    )
  }


  return (
    <>
      {clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentForm clientSecret={clientSecret} totalPrice={totalPrice} onSuccess={onSuccess} />
        </Elements>
      )}
    </>
  )
}

const formatAddressLine = (address) => {
  if (!address) return 'customer';
  return [address?.buildingName, address?.city, address?.country].filter(Boolean).join(', ') || 'customer';
};

export default StripePayment