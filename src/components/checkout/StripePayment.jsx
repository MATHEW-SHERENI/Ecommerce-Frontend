import { Alert, AlertTitle, Skeleton } from '@mui/material'
import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createStripeCheckoutSession } from '../../store/actions';

const frontendBase = (import.meta.env.VITE_FRONTEND_URL || "").replace(/\/$/, "");

const StripePayment = () => {
  const dispatch = useDispatch();
  const { totalPrice } = useSelector((state) => state.carts);
  const { isLoading, errorMessage } = useSelector((state) => state.errors);
  const { user, selectedUserCheckoutAddress } = useSelector((state) => state.auth);
  const startedRef = useRef(false);

  const persistedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("auth") || "null");
    } catch (e) {
      return null;
    }
  })();

  const persistedCheckoutAddress = (() => {
    try {
      return JSON.parse(localStorage.getItem("CHECKOUT_ADDRESS") || "null");
    } catch (e) {
      return null;
    }
  })();

  const effectiveUser = user || persistedUser;
  const effectiveSelectedAddress =
    selectedUserCheckoutAddress?.addressId
      ? selectedUserCheckoutAddress
      : persistedCheckoutAddress;

  const emailForStripe = effectiveUser?.email || effectiveUser?.username || "";

  useEffect(() => {
    if (startedRef.current) return;
    if (!emailForStripe || !effectiveSelectedAddress?.addressId) return;
    if (errorMessage) return;

    startedRef.current = true;

    const sendData = {
      amount: Number(totalPrice) * 100,
      currency: "usd",
      email: emailForStripe,
      name: `${effectiveUser.username}`,
      description: `Order for ${emailForStripe}`,
      successUrl: `${frontendBase}/order-confirm?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${frontendBase}/checkout`,
      metadata: {},
    };
    dispatch(createStripeCheckoutSession(sendData));
  }, [dispatch, emailForStripe, effectiveSelectedAddress?.addressId, totalPrice, effectiveUser?.username, errorMessage]);

  if (isLoading) {
    return (
      <div className='max-w-lg mx-auto px-4'>
        <p className="text-center text-gray-600 mb-4">
          Redirecting you to Stripe Checkout…
        </p>
        <Skeleton variant="rectangular" height={120} />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className='max-w-lg mx-auto px-4'>
        <Alert severity="error">
          <AlertTitle>Could not start checkout</AlertTitle>
          {errorMessage}
        </Alert>
      </div>
    );
  }

  if (!effectiveSelectedAddress?.addressId) {
    return (
      <div className='max-w-lg mx-auto px-4'>
        <Alert severity="warning">
          <AlertTitle>Missing checkout details</AlertTitle>
          Please select a valid checkout address again before starting Stripe checkout.
        </Alert>
      </div>
    );
  }

  if (!effectiveUser?.username) {
    return (
      <div className='max-w-lg mx-auto px-4'>
        <Alert severity="warning">
          <AlertTitle>Missing checkout details</AlertTitle>
          You are not logged in. Please log in again and try checkout.
        </Alert>
      </div>
    );
  }

  return (
    <div className='max-w-lg mx-auto px-4 text-center text-gray-600'>
      Preparing secure checkout…
    </div>
  );
}

export default StripePayment
