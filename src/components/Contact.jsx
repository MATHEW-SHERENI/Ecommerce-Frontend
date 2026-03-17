import { FaEnvelope, FaMapMarkedAlt, FaPhone } from "react-icons/fa";

const Contact = () => {
    const onSubmitHandler = (event) => {
        event.preventDefault();
    };

    return(
        <div className="min-h-[calc(100vh-64px)] bg-slate-100 py-12 px-4 sm:px-8 lg:px-14">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-slate-900">Contact Us</h1>
                    <p className="text-slate-600 mt-3 max-w-2xl mx-auto">
                        Have questions about your order or need help with products? Send us a message and our team will get back to you soon.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-3 bg-white rounded-xl shadow-custom p-6 sm:p-8">
                        <h2 className="text-2xl font-semibold text-slate-900 mb-6">Send us a message</h2>

                        <form className="space-y-5" onSubmit={onSubmitHandler}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                                        Full Name
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        required
                                        className="w-full border border-slate-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-custom-blue"
                                        placeholder="Enter your name"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        className="w-full border border-slate-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-custom-blue"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-1">
                                    Subject
                                </label>
                                <input
                                    id="subject"
                                    type="text"
                                    required
                                    className="w-full border border-slate-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-custom-blue"
                                    placeholder="How can we help?"
                                />
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    rows="6"
                                    required
                                    className="w-full border border-slate-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-custom-blue"
                                    placeholder="Write your message here"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full sm:w-auto bg-custom-blue text-white px-8 py-2.5 rounded-md font-semibold hover:opacity-90 transition-opacity duration-200"
                            >
                                Send Message
                            </button>
                        </form>
                    </div>

                    <div className="lg:col-span-2 bg-custom-gradient text-white rounded-xl shadow-custom p-6 sm:p-8">
                        <h2 className="text-2xl font-semibold mb-6">Get in touch</h2>
                        <p className="text-slate-200 mb-6">
                            Our support team is available Monday to Friday. We usually respond within one business day.
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <FaPhone className="text-slate-100 mt-1" />
                                <div>
                                    <p className="font-semibold">Phone</p>
                                    <p className="text-slate-200">+1 314 314 3144</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <FaEnvelope className="text-slate-100 mt-1" />
                                <div>
                                    <p className="font-semibold">Email</p>
                                    <p className="text-slate-200">info@smartcart.com</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <FaMapMarkedAlt className="text-slate-100 mt-1" />
                                <div>
                                    <p className="font-semibold">Address</p>
                                    <p className="text-slate-200">1 North Grand, St Louis, MO, USA</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 border-t border-slate-600 pt-5">
                            <p className="text-sm text-slate-200">Customer Support Hours</p>
                            <p className="font-semibold">Mon - Fri: 9:00 AM - 6:00 PM</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Contact;