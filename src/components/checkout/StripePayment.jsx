import { Alert, AlertTitle, Skeleton } from '@mui/material'
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PaymentForm from './PaymentForm';
import { createStripePaymentSecret } from '../../store/actions';

const stripeKey = (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "").trim();
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

const StripePayment = () => {
  const dispatch = useDispatch();
  const { clientSecret } = useSelector((state) => state.auth);
  const { totalPrice } = useSelector((state) => state.carts);
  const { isLoading, errorMessage } = useSelector((state) => state.errors);
  const { user, selectedUserCheckoutAddress } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!clientSecret) {
    const sendData = {
      amount: Number(totalPrice) * 100,
      currency: "usd",
      email: user.email,
      name: `${user.username}`,
      address: selectedUserCheckoutAddress,
      description: `Order for ${user.email}`,
      metadata: {
        test: "1"
      }
    };
      dispatch(createStripePaymentSecret(sendData));
    }
  }, [clientSecret]);

  if (isLoading) {
    return (
      <div className='max-w-lg mx-auto'>
        <Skeleton />
      </div>
    )
  }

  if (!stripePromise) {
    return (
      <Alert severity="warning">
        <AlertTitle>Stripe key missing</AlertTitle>
        Set <strong>VITE_STRIPE_PUBLISHABLE_KEY</strong> in your .env file to enable card payments.
      </Alert>
    );
  }


  return (
    <>
      {clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentForm clientSecret={clientSecret} totalPrice={totalPrice} />
        </Elements>
      )}
    </>
  )
}

export default StripePayment