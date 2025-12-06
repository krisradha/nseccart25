import React from 'react';
import { TreeDeciduous, Leaf, Heart, Recycle, BookOpen, DollarSign, Users, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const Value: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      
      {/* Hero Section with Fade In Animation */}
      <div className="bg-[#232F3E] text-white py-20 px-4 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10 animate-fade-in-up">
          <div className="inline-flex items-center justify-center p-3 bg-green-500/20 rounded-full mb-6">
            <TreeDeciduous className="h-8 w-8 text-green-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            The Earth-Friendly Choice
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Saving trees, resources, and empowering your campus community—one used book at a time.
          </p>
        </div>
        
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
           <Leaf className="absolute top-10 left-10 h-32 w-32 rotate-45" />
           <Recycle className="absolute bottom-10 right-10 h-64 w-64 -rotate-12" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Environmental Impact Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Why It Matters</h2>
            <p className="mt-4 text-lg text-gray-600">The production of new books has a massive environmental footprint.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border-t-4 border-green-500 transform hover:-translate-y-1 duration-300">
              <TreeDeciduous className="h-10 w-10 text-green-600 mb-4" />
              <h3 className="text-xl font-bold mb-3">Saving Trees</h3>
              <p className="text-gray-600 leading-relaxed">
                Recycling one ton of paper saves ~17 trees. By facilitating reuse, you prevent the need for the tree to be cut down in the first place.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border-t-4 border-blue-500 transform hover:-translate-y-1 duration-300 delay-100">
              <Leaf className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold mb-3">Lowering Carbon</h3>
              <p className="text-gray-600 leading-relaxed">
                Producing a new book generates ~1 kg of CO₂. A used book contributes practically zero additional emissions.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border-t-4 border-teal-500 transform hover:-translate-y-1 duration-300 delay-200">
              <Recycle className="h-10 w-10 text-teal-600 mb-4" />
              <h3 className="text-xl font-bold mb-3">Circular Economy</h3>
              <p className="text-gray-600 leading-relaxed">
                Books that aren't reused often end up in landfills. Giving your book a second life ensures it stays out of the waste stream.
              </p>
            </div>
          </div>
        </div>

        {/* Is It Worth It? Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-20">
          <div className="bg-[#febd69] p-8 text-center">
             <h2 className="text-3xl font-bold text-gray-900">💸 Is It Worth It?</h2>
             <p className="text-gray-900 font-medium mt-2 opacity-90">Selling Your Study Materials at a Low Price</p>
          </div>
          
          <div className="p-8 md:p-12">
            <div className="prose max-w-none text-gray-600 mb-10 text-center">
              <p className="text-lg">
                The simple act of selling your old textbooks at an affordable price generates value in three critical areas: <span className="font-bold text-gray-900">Personal Growth, Financial Experience, and Societal Impact.</span>
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              
              {/* Value You Receive */}
              <div>
                <h3 className="flex items-center text-xl font-bold text-gray-900 mb-6">
                  <Award className="h-6 w-6 mr-2 text-purple-600" />
                  The Value You Receive
                </h3>
                <ul className="space-y-4">
                  {[
                    { title: "Entrepreneurial Experience", desc: "Learn to list, price, and market." },
                    { title: "Negotiation Skills", desc: "Sharpen interpersonal skills with real buyers." },
                    { title: "Social Reputation (Karma)", desc: "Become a trusted, helpful senior." },
                    { title: "De-cluttering", desc: "Convert clutter into peace of mind." },
                    { title: "The Joy of Giving", desc: "Promote selfless service (Seva)." }
                  ].map((item, idx) => (
                    <li key={idx} className="flex bg-gray-50 p-4 rounded-lg">
                      <div className="flex-shrink-0 h-2 w-2 mt-2 rounded-full bg-purple-500 mr-4"></div>
                      <div>
                        <span className="font-bold text-gray-900 block">{item.title}</span>
                        <span className="text-sm">{item.desc}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Value for Buyer */}
              <div>
                <h3 className="flex items-center text-xl font-bold text-gray-900 mb-6">
                  <Heart className="h-6 w-6 mr-2 text-red-600" />
                  The Value for the Buyer
                </h3>
                <div className="space-y-6">
                  <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
                    <h4 className="font-bold text-blue-900 mb-2">Access to Education</h4>
                    <p className="text-sm text-blue-800">
                      Selling at 50-70% off makes education equitable for students on a tight budget.
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-500">
                    <h4 className="font-bold text-yellow-900 mb-2">A Head Start</h4>
                    <p className="text-sm text-yellow-800">
                      Used materials often come with valuable notes and highlights—a "study blueprint" for success.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* The Verdict Section */}
        <div className="grid md:grid-cols-2 gap-8 items-center mb-16">
          <div className="order-2 md:order-1">
             <h2 className="text-3xl font-bold text-gray-900 mb-6">The Verdict: Absolutely Yes.</h2>
             <p className="text-gray-600 mb-6 text-lg">
               By selling low, you stop being just a seller and become a <span className="font-bold text-gray-900">contributor</span>—gaining business experience, clearing your space, and empowering a fellow student's future.
             </p>
             
             <div className="bg-white p-6 rounded-lg border shadow-sm">
               <h4 className="font-bold mb-4 flex items-center">
                 <BookOpen className="h-5 w-5 mr-2 text-gray-700" />
                 How to do it right:
               </h4>
               <ol className="list-decimal list-inside space-y-2 text-gray-700">
                 <li>Set a price 20-30% of original cost.</li>
                 <li>List on NSEC Cart for instant visibility.</li>
                 <li>Offer bundle deals (e.g., "All 1st Year Books").</li>
               </ol>
             </div>
             
             <div className="mt-8">
               <Link to="/sell" className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-gray-900 bg-[#febd69] hover:bg-[#f3a847] shadow-lg transform hover:-translate-y-0.5 transition-all">
                 Start Selling Today
               </Link>
             </div>
          </div>
          <div className="order-1 md:order-2 flex justify-center">
             {/* Abstract Graphic Representation */}
             <div className="relative w-64 h-64 md:w-80 md:h-80 bg-green-100 rounded-full flex items-center justify-center animate-pulse-slow">
                <div className="w-48 h-48 md:w-60 md:h-60 bg-green-200 rounded-full flex items-center justify-center">
                   <DollarSign className="h-24 w-24 text-green-600 opacity-80" />
                </div>
                <div className="absolute top-0 right-0 bg-white p-4 rounded-full shadow-lg animate-bounce-slow">
                   <Heart className="h-8 w-8 text-red-500" />
                </div>
                <div className="absolute bottom-10 left-0 bg-white p-4 rounded-full shadow-lg">
                   <Users className="h-8 w-8 text-blue-500" />
                </div>
             </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translate3d(0, 40px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        .animate-pulse-slow {
           animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-bounce-slow {
           animation: bounce 3s infinite;
        }
      `}</style>
    </div>
  );
};

export default Value;
