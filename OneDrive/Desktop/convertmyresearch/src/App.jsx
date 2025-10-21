import React, { useState, useEffect } from 'react';
import { ChevronDown, Upload, Lock, Download, Check, BookOpen, Shield, Zap, Users, FileText, Clock } from 'lucide-react';

export default function ConvertMyResearch() {
  const [showPreview, setShowPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewComplete, setPreviewComplete] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [exitEmail, setExitEmail] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setUploading(true);
      setShowPreview(true);
      setTimeout(() => {
        setUploading(false);
        setTimeout(() => setPreviewComplete(true), 500);
      }, 2000);
    }
  };

  // Exit intent detection
  React.useEffect(() => {
    let exitIntentShown = false;
    const sessionStart = Date.now();

    const handleMouseLeave = (e) => {
      if (e.clientY <= 0 && !exitIntentShown && !showExitPopup) {
        const timeOnSite = Date.now() - sessionStart;
        if (timeOnSite > 30000) {
          setShowExitPopup(true);
          exitIntentShown = true;
        }
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [showExitPopup]);

  const handleExitEmailSubmit = () => {
    console.log('Exit email submitted:', exitEmail);
    alert('Check your inbox! Guide + $50 discount code sent.');
    setShowExitPopup(false);
  };

  const scrollToPreview = () => {
    document.getElementById('preview-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToHow = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-blue-900" />
            <span className="text-2xl font-bold text-blue-900">Convert My Research</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-blue-900 font-semibold">$199</span>
            <button 
              onClick={scrollToPreview}
              className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors font-semibold"
            >
              See It Work
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-blue-900 mb-6 leading-tight">
            Turn Your Academic Work Into a<br />
            Published Book—In 24 Hours
          </h1>
          <p className="text-xl text-gray-700 mb-4 max-w-3xl mx-auto">
            Professional AI conversion transforms your PhD dissertation, Master's thesis, or research into an accessible eBook. $199, delivered tomorrow.
          </p>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Your family finally understands your work. Your research reaches real readers. You earn from your expertise.
          </p>
          
          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              <span className="font-semibold">24-hour delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              <span className="font-semibold">247 researchers</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              <span className="font-semibold">Money-back guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-green-600" />
              <span className="font-semibold">IP protected</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={scrollToPreview}
              className="bg-amber-600 text-white px-8 py-4 rounded-lg hover:bg-amber-700 transition-colors text-lg font-semibold shadow-lg"
            >
              See Your Thesis Transformed (Free)
            </button>
            <button 
              onClick={scrollToHow}
              className="bg-white text-blue-900 px-8 py-4 rounded-lg hover:bg-gray-50 transition-colors text-lg font-semibold border-2 border-blue-900"
            >
              How It Works
            </button>
          </div>
          
          {/* Urgency Banner */}
          <div className="mt-6 inline-block bg-gradient-to-r from-amber-100 to-amber-50 border-2 border-amber-400 rounded-lg px-6 py-3">
            <p className="text-sm font-semibold text-amber-900">
              ⚡ Launch pricing ends October 31st • $199 → $249 starting November
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof Banner */}
      <section className="py-8 bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-lg">
            Trusted by <span className="font-semibold">PhD and Master's graduates</span> from MIT • Stanford • Oxford • Cambridge • UC Berkeley
          </p>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-blue-900 mb-16">
            The Problem Isn't Your Research. It's the Translation.
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <Clock className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-3">180 Hours of Rewriting</h3>
              <p className="text-gray-600">
                Manually converting academic prose into accessible language takes months of tedious work
              </p>
            </div>
            <div className="text-center p-6">
              <span className="text-5xl font-bold text-amber-500 block mb-4">$15,000</span>
              <h3 className="text-2xl font-bold mb-3">For an Editor</h3>
              <p className="text-gray-600">
                Professional editors charge thousands to restructure your thesis for commercial publication
              </p>
            </div>
            <div className="text-center p-6">
              <span className="text-5xl font-bold text-amber-500 block mb-4">18 Months</span>
              <h3 className="text-2xl font-bold mb-3">For University Press</h3>
              <p className="text-gray-600">
                Traditional publishers reject 95% of submissions and take years to publish
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Emotional Appeal Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-amber-50 via-blue-50 to-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-blue-900 mb-12">
            Your Research Deserves Readers
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-900">
              <h3 className="text-xl font-bold text-blue-900 mb-3 flex items-center gap-2">
                <Users className="w-6 h-6 text-amber-500" />
                For Your Family
              </h3>
              <p className="text-gray-700 mb-3">
                Your parents sat through years of "How's the research going?" without understanding a word of what you were actually doing.
              </p>
              <p className="text-gray-700 mb-3">
                Your partner supported you through late nights and missed dinners, never quite grasping why it mattered so much.
              </p>
              <p className="text-gray-700 font-semibold">
                Give them a book they can finally be proud of.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-amber-500">
              <h3 className="text-xl font-bold text-blue-900 mb-3 flex items-center gap-2">
                <span className="text-2xl">💰</span>
                For Your Income
              </h3>
              <p className="text-gray-700 mb-3">
                Right now, your research earns you $0. Published researchers turn their theses into $5K-$50K in passive income—plus speaking gigs, consulting contracts, and career opportunities.
              </p>
              <p className="text-gray-700 font-semibold">
                Your expertise is sitting in a database when it could be working for you.
              </p>
            </div>
          </div>
          <div className="mt-8 text-center bg-white p-6 rounded-xl shadow-lg">
            <p className="text-lg text-gray-700 italic mb-2">
              "When my mom finally read my book, she cried. She understood what I'd been doing all those years."
            </p>
            <p className="text-gray-600 font-semibold">— Dr. Jennifer Park, UC Berkeley</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-blue-900 mb-16">
            From Defense to Published in 3 Simple Steps
          </h2>
          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="text-center relative">
              <div className="bg-blue-900 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">1</div>
              <Upload className="w-12 h-12 text-blue-900 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3">Upload Your Research</h3>
              <p className="text-gray-600">
                PhD thesis, Master's dissertation, or research project—any format up to 100,000 words
              </p>
            </div>
            <div className="text-center relative">
              <div className="bg-blue-900 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">2</div>
              <FileText className="w-12 h-12 text-blue-900 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3">Customize Your Tone</h3>
              <p className="text-gray-600">
                Tell us who your ideal reader is with 5 quick questions
              </p>
            </div>
            <div className="text-center relative">
              <div className="bg-blue-900 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">3</div>
              <Download className="w-12 h-12 text-blue-900 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3">Download Your eBook</h3>
              <p className="text-gray-600">
                Get your publishable draft in 24 hours plus Amazon publishing guide
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Free Preview Section */}
      <section id="preview-section" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-amber-50 to-blue-50 rounded-2xl p-8 md:p-12 shadow-xl">
            <h2 className="text-3xl font-bold text-center text-blue-900 mb-4">
              See It In Action—Free
            </h2>
            <p className="text-center text-gray-700 mb-8">
              Upload a 10-page sample from your thesis. We'll convert it instantly so you can see the transformation.
            </p>
            
            {!showPreview ? (
              <div className="border-4 border-dashed border-blue-300 rounded-xl p-12 text-center bg-white">
                <Upload className="w-16 h-16 text-blue-900 mx-auto mb-4" />
                <label htmlFor="file-upload" className="cursor-pointer block">
                  <span className="text-blue-900 font-semibold text-lg block mb-2">
                    Drag your PDF here or click to browse
                  </span>
                  <button 
                    type="button"
                    onClick={() => document.getElementById('file-upload').click()}
                    className="bg-blue-900 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition-colors font-semibold mt-4"
                  >
                    Choose File
                  </button>
                </label>
                <input 
                  id="file-upload"
                  type="file" 
                  accept=".pdf"
                  className="hidden" 
                  onChange={handleFileUpload}
                />
                <p className="text-sm text-gray-600 mt-4">
                  10 pages max • No account required • See results in 60 seconds
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-6">
                {uploading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin w-16 h-16 border-4 border-blue-900 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-lg font-semibold text-blue-900">Analyzing your thesis...</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="border-2 border-gray-200 rounded-lg p-4">
                      <h4 className="font-bold text-blue-900 mb-3">Your Original (Academic)</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        The empirical findings indicate a statistically significant correlation (p &lt; 0.05) between managerial communication frequency and employee engagement metrics (Smith et al., 2019; Jones, 2021). The multivariate regression analysis revealed that organizations implementing bi-weekly one-on-one meetings demonstrated a 23% increase in self-reported engagement scores relative to control groups (n=847).
                      </p>
                    </div>
                    <div className={`border-2 border-green-300 bg-green-50 rounded-lg p-4 transition-opacity duration-500 ${previewComplete ? 'opacity-100' : 'opacity-0'}`}>
                      <h4 className="font-bold text-green-800 mb-3">Our Conversion (Accessible)</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        When managers check in more often, employees feel more connected to their work—and the data proves it. Companies that held bi-weekly one-on-ones saw employee engagement jump by 23%. That's not a small difference; it's the kind of change that transforms workplace culture.
                      </p>
                    </div>
                  </div>
                )}
                {previewComplete && (
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600 mb-4">This is just 1 paragraph from your thesis</p>
                    <a 
                      href="https://buy.stripe.com/4gMdR8aq98B4cGdaznaIM00"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-amber-600 text-white px-8 py-4 rounded-lg hover:bg-amber-700 transition-colors text-lg font-semibold shadow-lg"
                    >
                      Get My Book Draft ($199)
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* IP Protection Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-900 to-blue-800 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Lock className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-4xl font-bold mb-4">
              🔒 Your Research Stays Yours. Forever.
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Your thesis is processed in real-time and deleted within 24 hours—no exceptions. We don't store your text, train models on your work, or share data with third parties.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white/10 rounded-lg backdrop-blur">
              <Shield className="w-12 h-12 mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2">Zero Retention Architecture</h3>
              <p className="text-blue-100 text-sm">Automatically purged after processing</p>
            </div>
            <div className="text-center p-6 bg-white/10 rounded-lg backdrop-blur">
              <Lock className="w-12 h-12 mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2">No Model Training</h3>
              <p className="text-blue-100 text-sm">Your content never trains our AI</p>
            </div>
            <div className="text-center p-6 bg-white/10 rounded-lg backdrop-blur">
              <Check className="w-12 h-12 mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2">Encrypted Processing</h3>
              <p className="text-blue-100 text-sm">Bank-level AES-256 encryption</p>
            </div>
          </div>
          <div className="text-center mt-8">
            <button className="text-amber-300 hover:text-amber-200 font-semibold underline">
              Read Our Security Whitepaper →
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-blue-900 mb-16">
            One Thesis. One Price. One Transformation.
          </h2>
          <div className="bg-gradient-to-br from-blue-50 to-amber-50 rounded-2xl p-8 md:p-12 shadow-2xl border-2 border-blue-200">
            <div className="text-center mb-8">
              <div className="text-6xl font-bold text-blue-900 mb-2">$199</div>
              <div className="text-xl text-gray-700 font-semibold">Complete Conversion Package</div>
              <div className="mt-2 text-sm text-amber-700 font-semibold">
                Launch pricing • Increases to $249 on Nov 1st
              </div>
            </div>
            <div className="space-y-4 mb-8">
              {[
                'Full thesis conversion (up to 100,000 words)',
                'Conversational eBook draft (40,000-60,000 words)',
                'Citation removal & tone transformation',
                'Microsoft Word + EPUB/MOBI formats',
                'Factual grounding report',
                '24-hour delivery',
                'Amazon publishing guide included'
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
            <div className="bg-blue-900 text-white p-4 rounded-lg mb-6 text-center">
              <p className="text-sm">
                <strong>Money-back guarantee:</strong> If our draft doesn't save you 100+ hours, full refund—no questions asked
              </p>
            </div>
            <a 
              href="https://buy.stripe.com/4gMdR8aq98B4cGdaznaIM00"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-amber-600 text-white px-8 py-4 rounded-lg hover:bg-amber-700 transition-colors text-lg font-semibold shadow-lg text-center"
            >
              Get My Book Draft
            </a>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-blue-900 mb-4">
            "Can't I Just Use ChatGPT for Free?"
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            We get this question a lot. Here's why 247 researchers chose us over DIY:
          </p>
          
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
              {/* ChatGPT Column */}
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                    🤖
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">ChatGPT</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="text-red-500 font-bold text-xl flex-shrink-0">✗</span>
                    <div>
                      <p className="font-semibold text-gray-900">4,000 word limit</p>
                      <p className="text-sm text-gray-600">Can't process full thesis (80K+ words)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <span className="text-red-500 font-bold text-xl flex-shrink-0">✗</span>
                    <div>
                      <p className="font-semibold text-gray-900">Loses context</p>
                      <p className="text-sm text-gray-600">Forgets earlier chapters, breaks narrative flow</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <span className="text-red-500 font-bold text-xl flex-shrink-0">✗</span>
                    <div>
                      <p className="font-semibold text-gray-900">Generic tone</p>
                      <p className="text-sm text-gray-600">One-size-fits-all style, no customization</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <span className="text-red-500 font-bold text-xl flex-shrink-0">✗</span>
                    <div>
                      <p className="font-semibold text-gray-900">Just raw text</p>
                      <p className="text-sm text-gray-600">No formatting, files, or publishing guidance</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <span className="text-amber-500 font-bold flex-shrink-0">⏱</span>
                    <div>
                      <p className="font-semibold text-gray-900">40+ hours of work</p>
                      <p className="text-sm text-gray-600">Copy-pasting chunks, stitching together, formatting</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Convert My Research Column */}
              <div className="p-8 bg-gradient-to-br from-blue-50 to-white">
                <div className="flex items-center gap-3 mb-6">
                  <BookOpen className="w-12 h-12 text-blue-900" />
                  <h3 className="text-xl font-bold text-blue-900">Convert My Research</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="text-green-600 font-bold text-xl flex-shrink-0">✓</span>
                    <div>
                      <p className="font-semibold text-gray-900">100,000 word capacity</p>
                      <p className="text-sm text-gray-600">Handles your entire thesis in one go</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <span className="text-green-600 font-bold text-xl flex-shrink-0">✓</span>
                    <div>
                      <p className="font-semibold text-gray-900">Full coherence</p>
                      <p className="text-sm text-gray-600">Maintains narrative arc across all chapters</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <span className="text-green-600 font-bold text-xl flex-shrink-0">✓</span>
                    <div>
                      <p className="font-semibold text-gray-900">Custom tone profiles</p>
                      <p className="text-sm text-gray-600">Tailored for executives, practitioners, or general readers</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <span className="text-green-600 font-bold text-xl flex-shrink-0">✓</span>
                    <div>
                      <p className="font-semibold text-gray-900">Formatted files + guide</p>
                      <p className="text-sm text-gray-600">Word, EPUB, MOBI + Amazon publishing roadmap</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold flex-shrink-0">⚡</span>
                    <div>
                      <p className="font-semibold text-gray-900">24 hours total</p>
                      <p className="text-sm text-gray-600">Upload today, download tomorrow</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bottom CTA */}
            <div className="bg-blue-900 text-white p-6 text-center">
              <p className="text-lg mb-4">
                <strong>Bottom line:</strong> ChatGPT is free, but your time isn't. Save 40+ hours for $199.
              </p>
              <a 
                href="https://buy.stripe.com/4gMdR8aq98B4cGdaznaIM00"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-amber-600 text-white px-8 py-3 rounded-lg hover:bg-amber-700 transition-colors font-semibold"
              >
                Get My Book Draft ($199)
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-blue-900 mb-16">
            Why Researchers Choose Convert My Research
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <Clock className="w-12 h-12 text-amber-500 mb-4" />
              <h3 className="text-xl font-bold mb-3">Save 180 Hours</h3>
              <p className="text-gray-600">
                Skip months of manual rewriting. Our AI handles the tone conversion while you focus on what's next.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <Users className="w-12 h-12 text-amber-500 mb-4" />
              <h3 className="text-xl font-bold mb-3">Preserve Your Voice</h3>
              <p className="text-gray-600">
                We don't ghostwrite—we translate your existing work into accessible language while keeping your ideas intact.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <Shield className="w-12 h-12 text-amber-500 mb-4" />
              <h3 className="text-xl font-bold mb-3">Protect Your IP</h3>
              <p className="text-gray-600">
                Enterprise-grade security. Your thesis is processed and permanently deleted within 24 hours.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <Zap className="w-12 h-12 text-amber-500 mb-4" />
              <h3 className="text-xl font-bold mb-3">Launch Fast</h3>
              <p className="text-gray-600">
                From upload to Amazon in 2 weeks. Don't wait 18 months for a university press rejection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-blue-900 mb-16">
            What Researchers Are Saying
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Dr. Sarah Chen',
                title: 'Organizational Psychology PhD',
                quote: 'I spent 5 years on my dissertation about workplace well-being. My parents are Chinese immigrants who barely speak English—they had no idea what I was studying. Now they have a book they can show their friends. That alone was worth $199.'
              },
              {
                name: 'James Martinez',
                title: 'Environmental Science MS',
                quote: 'I published my thesis as an eBook on Amazon for $9.99. In 6 months, I\'ve sold 847 copies and earned $6,200. The conversion paid for itself 31 times over, and I\'m now getting consulting requests from NGOs.'
              },
              {
                name: 'Dr. Aisha Patel',
                title: 'Education EdD',
                quote: 'My research on inclusive teaching sat in a database collecting dust. Now it\'s a book that teachers actually buy and use. I\'ve spoken at 4 conferences because of it. My dissertation finally matters beyond my committee.'
              }
            ].map((testimonial, i) => (
              <div key={i} className="bg-blue-50 p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-bold text-blue-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.title}</div>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-blue-900 mb-16">
            Common Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: 'Will it sound like I wrote it?',
                a: 'Yes. We preserve your voice and ideas—we just make them accessible. Think of it like translating your work from "academic" to "human" while keeping the substance intact.'
              },
              {
                q: 'Is this plagiarism or academic misconduct?',
                a: 'No. You\'re the original author of your thesis. Convert My Research is a tone conversion tool, like hiring an editor. You retain full authorship because the research and ideas are yours.'
              },
              {
                q: 'What happens to my thesis after I upload it?',
                a: 'Your file is processed in an encrypted session and permanently deleted within 24 hours. We don\'t store your work, train AI models on it, or share it with anyone. Request a deletion certificate anytime.'
              },
              {
                q: 'Can I edit the output?',
                a: 'Absolutely. You get an editable Word document. Most users make minor tweaks (10-15%) before publishing. It\'s a draft, not a final product.'
              },
              {
                q: 'How long does conversion take?',
                a: '24 hours from upload to delivery. If you need it faster, email us—we often deliver in 12 hours.'
              },
              {
                q: 'What if I\'m not satisfied?',
                a: 'Full refund, no questions asked. If the draft doesn\'t save you significant time, we don\'t deserve your money.'
              },
              {
                q: 'What if I can\'t afford $199?',
                a: 'We believe every scholar deserves to share their work. If the standard price is a genuine barrier, email us at hello@convertmyresearch.com with your situation. We offer case-by-case discounts for students facing financial hardship.'
              },
              {
                q: 'I wrote a Master\'s dissertation, not a PhD thesis. Can I use this?',
                a: 'Absolutely! We convert any academic research document—PhD theses, Master\'s dissertations, research projects, etc. If it\'s dense academic writing that needs to be accessible, we can help.'
              }
            ].map((faq, i) => (
              <div key={i} className="bg-white rounded-lg shadow">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-blue-900">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-blue-900 transition-transform ${expandedFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {expandedFaq === i && (
                  <div className="px-6 pb-6 text-gray-700">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-900 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Don't Let Your Life's Work Gather Dust
          </h2>
          <p className="text-xl text-blue-100 mb-4">
            You sacrificed weekends, relationships, and sleep for this research. It deserves to be read.
          </p>
          <p className="text-lg text-blue-200 mb-8">
            Join 200+ PhD and Master's graduates who've turned their research into published books—and given their families something to be proud of.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={scrollToPreview}
              className="bg-amber-600 text-white px-8 py-4 rounded-lg hover:bg-amber-700 transition-colors text-lg font-semibold shadow-lg"
            >
              See It Work (Free Demo)
            </button>
            <a 
              href="https://buy.stripe.com/4gMdR8aq98B4cGdaznaIM00"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-blue-900 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors text-lg font-semibold inline-block"
            >
              Get My Book Draft
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Product</h3>
            <div className="space-y-2 text-gray-400">
              <div><button onClick={scrollToHow} className="hover:text-white">How It Works</button></div>
              <div><button className="hover:text-white">Pricing</button></div>
              <div><button className="hover:text-white">Security</button></div>
              <div><button className="hover:text-white">FAQ</button></div>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Company</h3>
            <div className="space-y-2 text-gray-400">
              <div><button className="hover:text-white">About Us</button></div>
              <div><button className="hover:text-white">Contact</button></div>
              <div><button className="hover:text-white">Privacy Policy</button></div>
              <div><button className="hover:text-white">Terms of Service</button></div>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Resources</h3>
            <div className="space-y-2 text-gray-400">
              <div><button className="hover:text-white">Publishing Guide</button></div>
              <div><button className="hover:text-white">Sample Conversions</button></div>
              <div><button className="hover:text-white">Researcher Blog</button></div>
              <div><button className="hover:text-white">Security Whitepaper</button></div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>© 2025 Convert My Research. Built for researchers, by researchers.</p>
        </div>
      </footer>

      {/* Exit Intent Popup */}
      {showExitPopup && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 relative shadow-2xl">
            <button 
              onClick={() => setShowExitPopup(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-light"
            >
              ×
            </button>

            <div className="text-center mb-4">
              <span className="text-5xl">📚</span>
            </div>

            <h2 className="text-2xl font-bold text-blue-900 text-center mb-2">
              Wait—Before You Go...
            </h2>
            
            <p className="text-gray-600 text-center mb-6">
              Most PhD students don't know they can publish their thesis as a book. Here's how.
            </p>

            <div className="space-y-2 mb-6 text-sm">
              <p className="flex items-start gap-2">
                <span className="text-green-600 flex-shrink-0">✓</span>
                <span>"How to Self-Publish Your Thesis on Amazon" (Step-by-step guide)</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-green-600 flex-shrink-0">✓</span>
                <span>3 real before/after thesis conversions</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-green-600 flex-shrink-0">✓</span>
                <span>Pricing breakdown: What you'll actually earn</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-amber-500 font-semibold flex-shrink-0">★</span>
                <span className="font-semibold">Bonus: $50 off your conversion (valid 7 days)</span>
              </p>
            </div>

            <input
              type="email"
              value={exitEmail}
              onChange={(e) => setExitEmail(e.target.value)}
              placeholder="your.email@university.edu"
              className="w-full border-2 border-gray-300 rounded-lg p-3 mb-4 text-center focus:border-blue-500 focus:outline-none"
            />

            <button
              onClick={handleExitEmailSubmit}
              className="w-full bg-amber-600 text-white py-4 rounded-lg font-semibold hover:bg-amber-700 transition-colors text-lg mb-4"
            >
              Send Me the Guide (Free)
            </button>

            <p className="text-xs text-gray-500 text-center">
              No spam. We're PhD grads like you. Unsubscribe anytime.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}