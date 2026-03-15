import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ProductCard from './shared/ProductCard';
import { fetchProductsAction } from '../store/actions';

const About = () => {
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.product);

  useEffect(() => {
    if (!products || products.length === 0) {
      dispatch(fetchProductsAction('pageNumber=0&pageSize=6'));
    }
  }, [dispatch, products]);

  const spotlightProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    return products.slice(0, 3);
  }, [products]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-slate-800 text-4xl font-bold text-center mb-12">
        About Smartcart
      </h1>

      <div className="flex flex-col lg:flex-row justify-between items-center gap-8 mb-12">
        <div className="w-full lg:w-1/2 text-center lg:text-left">
          <p className="text-lg mb-4 text-slate-700">
            Smartcart is built to make online shopping simple, fast, and reliable.
            We focus on quality products, transparent pricing, and a smooth buying
            experience from discovery to checkout.
          </p>
          <p className="text-slate-600">
            Our goal is to help customers find the right products quickly while
            maintaining the trust and consistency expected from a modern e-commerce
            platform.
          </p>
        </div>

        <div className="w-full lg:w-1/2">
          <img
            src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=700&fit=crop"
            alt="Smartcart Team"
            className="w-full h-auto rounded-lg shadow-lg object-cover"
          />
        </div>
      </div>

      <div className="py-7 space-y-8">
        <h2 className="text-slate-800 text-3xl font-bold text-center">Featured Products</h2>

        {spotlightProducts.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spotlightProducts.map((product, index) => (
              <ProductCard key={product.productId ?? index} {...product} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-600">No products available yet.</div>
        )}
      </div>
    </div>
  );
};

export default About;
