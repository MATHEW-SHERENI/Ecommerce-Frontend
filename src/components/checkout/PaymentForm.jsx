import { Skeleton } from '@mui/material';
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import React from 'react'
import { useState } from 'react';
import toast from 'react-hot-toast';

const PaymentForm = ({ clientSecret, totalPrice, onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) {
            return;
        }

        setIsSubmitting(true);
        const { error: submitError } = await elements.submit();
        if (submitError) {
            setErrorMessage(submitError.message || "Unable to submit payment details.");
            setIsSubmitting(false);
            return;
        }

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            clientSecret,
            redirect: 'if_required',
        });

        if (error) {
            setErrorMessage(error.message);
            setIsSubmitting(false);
            return;
        }

        if (paymentIntent?.status === 'succeeded') {
            toast.success('Stripe payment successful');
            await onSuccess({
                provider: 'Stripe',
                id: paymentIntent.id,
                status: paymentIntent.status,
                details: paymentIntent,
            });
        } else {
            setErrorMessage('Payment did not complete. Please try again.');
        }

        setIsSubmitting(false);
    };

    const paymentElementOptions = {
        layout: "tabs",
    }

    const isLoading = !clientSecret || !stripe || !elements;

  return (
    <form onSubmit={handleSubmit} className='max-w-lg mx-auto p-4'>
        <h2 className='text-xl font-semibold mb-4'>Payment Information</h2>
        {isLoading ? (
            <Skeleton />
        ) : (
            <>
            {clientSecret && <PaymentElement  options={paymentElementOptions}/> }
            {errorMessage && (
                <div className='text-red-500 mt-2'>{errorMessage}</div>
            )}

            <button
                className='text-white w-full px-5 py-2.5 bg-black mt-2 rounded-md font-bold disabled:opacity-50 disabled:animate-pulse'
                disabled={!stripe || isLoading || isSubmitting}>
                    {!isLoading && !isSubmitting ? `Pay $${Number(totalPrice).toFixed(2)}`
                            : "Processing"}
            </button>
            </>
        )}
    </form>
  )
}

export default PaymentForm