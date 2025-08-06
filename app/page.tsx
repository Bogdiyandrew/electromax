import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/firebase/config';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = "force-dynamic"; // <-- ADAUGĂ LINIA ASTA AICI

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  imageUrl?: string;
}

async function getProducts(): Promise<Product[]> {
  const productsQuery = query(collection(db, "products"), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(productsQuery);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
}

const ProductCard = ({ product }: { product: Product }) => {
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-500 overflow-hidden group transform hover:-translate-y-2">
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative overflow-hidden bg-gray-700">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={400}
              height={240}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              style={{ objectFit: 'cover' }}
              className="w-full h-60 transition-all duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-60 bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-gray-400 text-sm font-medium">Produs Electric</span>
              </div>
            </div>
          )}
          
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full shadow-lg">
              NOU
            </span>
          </div>
          
          {/* Overlay gradient pentru hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
      </Link>
      
      <div className="p-6">
        <div className="mb-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-700 text-blue-400 border border-gray-600">
            {product.category}
          </span>
        </div>
        
        <h3 className="text-xl font-bold text-gray-50 mb-3 group-hover:text-blue-400 transition-colors duration-300 line-clamp-2 leading-tight">
          {product.name}
        </h3>
        
        <p className="text-gray-400 text-sm mb-6 line-clamp-2 leading-relaxed">
          {product.description || "Produs electric de înaltă calitate, perfect pentru nevoile tale profesionale și casnice."}
        </p>
        
        {/* Preț și rating */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white">{product.price.toFixed(2)}</span>
            <span className="text-lg text-gray-400">lei</span>
            {product.price > 100 && (
              <span className="text-sm text-gray-500 line-through ml-2">{(product.price * 1.20).toFixed(2)} lei</span>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-gray-400 text-sm font-medium">(4.8)</span>
          </div>
        </div>
        
        {/* Buton Vezi detalii - centrat și mai prominent */}
        <Link 
          href={`/product/${product.id}`}
          className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 shadow-lg hover:shadow-blue-500/50"
        >
          Vezi detalii
          <svg className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 overflow-hidden min-h-screen flex items-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%233b82f6' fill-opacity='0.3'%3E%3Cpath d='M50 50m-30 0a30,30 0 1,1 60,0a30,30 0 1,1 -60,0 M50 20v60 M20 50h60'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                ⚡ ElectroMax - Partenerul tău de încredere
              </span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-8 leading-tight">
              Energie pentru
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 block">
                fiecare proiect
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-10 leading-relaxed max-w-lg">
              <strong className="text-white">Peste 10.000 de produse</strong> electrice de calitate superioară. 
              De la becuri LED la sisteme complete de automatizare - găsești soluția perfectă pentru casa sau afacerea ta.
            </p>
            
            {/* Value propositions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              <div className="flex items-center space-x-3 p-4 rounded-lg bg-gray-800/50 border border-gray-700/50">
                <div className="w-3 h-3 bg-green-400 rounded-full flex-shrink-0 animate-pulse"></div>
                <span className="text-gray-200 font-medium">Transport gratuit peste 200 lei</span>
              </div>
              <div className="flex items-center space-x-3 p-4 rounded-lg bg-gray-800/50 border border-gray-700/50">
                <div className="w-3 h-3 bg-blue-400 rounded-full flex-shrink-0 animate-pulse"></div>
                <span className="text-gray-200 font-medium">Garanție extinsă 2-5 ani</span>
              </div>
              <div className="flex items-center space-x-3 p-4 rounded-lg bg-gray-800/50 border border-gray-700/50">
                <div className="w-3 h-3 bg-yellow-400 rounded-full flex-shrink-0 animate-pulse"></div>
                <span className="text-gray-200 font-medium">Consiliere tehnică gratuită</span>
              </div>
              <div className="flex items-center space-x-3 p-4 rounded-lg bg-gray-800/50 border border-gray-700/50">
                <div className="w-3 h-3 bg-purple-400 rounded-full flex-shrink-0 animate-pulse"></div>
                <span className="text-gray-200 font-medium">Produse certificate CE</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
              <Link 
                href="#products" 
                className="group inline-flex items-center justify-center px-10 py-5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xl rounded-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/50 shadow-2xl hover:shadow-blue-500/40 transform hover:scale-105"
              >
                Descoperă produsele
                <svg className="w-6 h-6 ml-3 transition-transform duration-300 group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              
              <Link 
                href="/contact" 
                className="inline-flex items-center justify-center px-10 py-5 bg-transparent hover:bg-gray-800/50 text-blue-400 hover:text-blue-300 font-semibold text-xl border-2 border-blue-500/50 hover:border-blue-400 rounded-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/30"
              >
                Contactează-ne
              </Link>
            </div>
          </div>
          
          <div className="relative order-1 lg:order-2">
            <div className="relative z-10">
              <Image 
                src="/hero.png" 
                alt="Produse electrice profesionale ElectroMax" 
                width={700}
                height={500}
                className="w-full h-auto rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-700"
                priority
              />
            </div>
            {/* Decorative elements enhanced */}
            <div className="absolute -top-8 -right-8 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-12 -left-12 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
            <div className="absolute top-1/2 -right-4 w-32 h-32 bg-yellow-400/10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
          </div>
        </div>
      </div>
    </section>
  );
};

const WhyChooseUsSection = () => {
  const reasons = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Calitate Certificată",
      description: "Toate produsele sunt testate și certificate CE. Selectăm doar brandurile de top din industrie.",
      highlight: "100% Certificate"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Livrare Rapidă",
      description: "Transport gratuit pentru comenzi peste 200 lei. Livrare în maximum 48h în toată țara.",
      highlight: "Gratuit >200 lei"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Suport Tehnic Expert",
      description: "Echipă de electricieni cu experiență. Consiliere gratuită pentru alegerea produselor potrivite.",
      highlight: "Consiliere Gratuită"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: "Garanție Extinsă",
      description: "Minimum 2 ani garanție pe toate produsele. Pentru unele categorii, garanție până la 5 ani.",
      highlight: "Până la 5 ani"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            De ce să alegi <span className="text-blue-400">ElectroMax</span>?
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Peste 15 ani de experiență în domeniul electric. Mii de clienți mulțumiți și proiecte finalizate cu succes.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {reasons.map((reason, index) => (
            <div key={index} className="group bg-gray-800 rounded-2xl border border-gray-700 p-8 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 transform hover:-translate-y-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <div className="text-blue-400 group-hover:text-blue-300 transition-colors duration-300">
                    {reason.icon}
                  </div>
                </div>
                
                <div className="mb-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-500 text-white">
                    {reason.highlight}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-50 mb-4 group-hover:text-blue-400 transition-colors duration-300">
                  {reason.title}
                </h3>
                
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                  {reason.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-4 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl border border-blue-500/30">
            <div className="flex -space-x-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-white font-bold text-sm">4.9</span>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full border-2 border-white flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="text-left">
              <p className="text-white font-bold text-lg">Peste 5.000 de clienți mulțumiți</p>
              <p className="text-gray-400">Rating mediu 4.9/5 stele pe toate platformele</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default async function HomePage() {
  const products = await getProducts();

  return (
    <main className="bg-gray-900 min-h-screen">
      <HeroSection />
      <WhyChooseUsSection />
      
      <section id="products" className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Produsele Noastre <span className="text-blue-400">Premium</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Fiecare produs este selectat cu grijă pentru calitate, durabilitate și performanță. 
              Găsești soluția perfectă pentru orice proiect electric.
            </p>
          </div>
          
          {products.length > 0 ? (
            <>
              <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.slice(0, 8).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              
              {products.length > 4 && (
                <div className="text-center mt-16">
                  <Link 
                    href="/products" 
                    className="group inline-flex items-center px-10 py-5 bg-transparent hover:bg-gray-800/50 text-blue-400 hover:text-blue-300 font-bold text-xl border-2 border-blue-500/50 hover:border-blue-400 rounded-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transform hover:scale-105"
                  >
                    Vezi toate produsele
                    <svg className="w-6 h-6 ml-3 transition-transform duration-300 group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <div className="w-32 h-32 bg-gradient-to-br from-gray-800 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-8">
                <svg className="w-16 h-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-300 mb-4">
                În curând produse noi spectaculoase
              </h3>
              <p className="text-gray-500 text-lg max-w-md mx-auto">
                Lucrăm să aducem cele mai inovatoare produse electrice pentru proiectele tale.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}