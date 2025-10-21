import React, { useState } from 'react';
import { Upload, Check, BookOpen, Mail, Clock, FileText, AlertCircle } from 'lucide-react';

export default function ThankYouPage() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;
    
    // Validate file type
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }
    
    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be under 50MB');
      return;
    }
    
    setError('');
    setUploadedFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!uploadedFile) {
      setError('Please select a file to upload');
      return;
    }
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setUploading(true);
    
    // Simulate upload (replace with actual upload logic later)
    setTimeout(() => {
      setUploading(false);
      setUploadComplete(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-2">
          <BookOpen className="w-8 h-8 text-blue-900" />
          <span className="text-2xl font-bold text-blue-900">Convert My Research</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!uploadComplete ? (
          <>
            {/* Success Message */}
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-10 h-10 text-green-600" />
                </div>
                <h1 className="text-4xl font-bold text-blue-900 mb-4">
                  🎉 Payment Successful!
                </h1>
                <p className="text-xl text-gray-700">
                  Thank you for your purchase. Your order is confirmed!
                </p>
              </div>

              {/* Order Details */}
              <div className="bg-blue-50 rounded-lg p-6 mb-8">
                <h2 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Your Order
                </h2>
                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between">
                    <span>Thesis to eBook Conversion</span>
                    <span className="font-semibold">$199.00</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    A receipt has been sent to your email.
                  </div>
                </div>
              </div>

              {/* Upload Section */}
              <div className="border-t-2 border-gray-200 pt-8">
                <h2 className="text-2xl font-bold text-blue-900 mb-4">
                  📤 Upload Your Thesis
                </h2>
                <p className="text-gray-700 mb-6">
                  Please upload your thesis PDF below. We'll process it and deliver your converted eBook within 24 hours.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Your Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@university.edu"
                      className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:outline-none"
                      required
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      We'll send your converted files to this email
                    </p>
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Thesis PDF File
                    </label>
                    
                    {!uploadedFile ? (
                      <div className="border-4 border-dashed border-blue-300 rounded-xl p-8 text-center bg-white hover:bg-blue-50 transition-colors">
                        <Upload className="w-12 h-12 text-blue-900 mx-auto mb-3" />
                        <label htmlFor="thesis-upload" className="cursor-pointer">
                          <span className="text-blue-900 font-semibold text-lg block mb-2">
                            Click to browse or drag and drop
                          </span>
                          <button 
                            type="button"
                            onClick={() => document.getElementById('thesis-upload').click()}
                            className="bg-blue-900 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition-colors font-semibold"
                          >
                            Choose File
                          </button>
                        </label>
                        <input 
                          id="thesis-upload"
                          type="file" 
                          accept=".pdf"
                          className="hidden" 
                          onChange={handleFileUpload}
                        />
                        <p className="text-sm text-gray-600 mt-4">
                          PDF only • Up to 100,000 words • Max 50MB
                        </p>
                      </div>
                    ) : (
                      <div className="border-2 border-green-300 bg-green-50 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Check className="w-6 h-6 text-green-600" />
                          <div>
                            <p className="font-semibold text-gray-900">{uploadedFile.name}</p>
                            <p className="text-sm text-gray-600">
                              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setUploadedFile(null)}
                          className="text-red-600 hover:text-red-700 font-semibold text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-red-800 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={uploading || !uploadedFile || !email}
                    className="w-full bg-amber-600 text-white px-8 py-4 rounded-lg hover:bg-amber-700 transition-colors text-lg font-semibold shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                        Uploading...
                      </span>
                    ) : (
                      'Upload Thesis'
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* What Happens Next */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-blue-900 mb-6">
                ✅ What Happens Next
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-900 font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">We Process Your Thesis</h3>
                    <p className="text-gray-600">
                      Our AI converts your academic writing into accessible, conversational prose while preserving your research and ideas.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-900 font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Delivery in 24 Hours</h3>
                    <p className="text-gray-600">
                      You'll receive an email with download links to your converted files. Most orders are completed in 12-16 hours.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-900 font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">You Receive Your Files</h3>
                    <p className="text-gray-600">
                      Get 3 formats: Microsoft Word (editable), EPUB (most e-readers), and MOBI (Kindle). Plus our Amazon publishing guide.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Section */}
            <div className="mt-8 bg-blue-900 text-white rounded-xl p-8 text-center">
              <Mail className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Questions or Issues?</h3>
              <p className="mb-4">
                We're here to help! Email us anytime and we'll respond within 2 hours.
              </p>
              <a 
                href="mailto:orders@convertmyresearch.com"
                className="inline-block bg-white text-blue-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                orders@convertmyresearch.com
              </a>
            </div>
          </>
        ) : (
          /* Upload Success Screen */
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-blue-900 mb-4">
              Upload Complete!
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              Thank you! We've received your thesis and have started processing.
            </p>
            
            <div className="bg-blue-50 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-blue-900" />
                <h3 className="font-bold text-blue-900">Expected Delivery</h3>
              </div>
              <p className="text-gray-700 text-lg">
                Within <strong>24 hours</strong>
              </p>
              <p className="text-gray-600 text-sm mt-2">
                (Most orders complete in 12-16 hours)
              </p>
            </div>

            <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
              <div className="flex items-start gap-3">
                <Mail className="w-6 h-6 text-amber-700 flex-shrink-0 mt-1" />
                <div className="text-left">
                  <h3 className="font-bold text-amber-900 mb-2">Check Your Email</h3>
                  <p className="text-amber-800 text-sm">
                    We'll send your converted files to: <strong>{email}</strong>
                  </p>
                  <p className="text-amber-700 text-sm mt-2">
                    Make sure to check your spam folder if you don't see it in your inbox.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-gray-900">You'll Receive:</h3>
              <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="bg-gray-50 rounded-lg p-4">
                  <FileText className="w-8 h-8 text-blue-900 mx-auto mb-2" />
                  <p className="font-semibold text-sm">Microsoft Word</p>
                  <p className="text-xs text-gray-600">Editable .docx</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <BookOpen className="w-8 h-8 text-blue-900 mx-auto mb-2" />
                  <p className="font-semibold text-sm">EPUB + MOBI</p>
                  <p className="text-xs text-gray-600">E-reader formats</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <FileText className="w-8 h-8 text-blue-900 mx-auto mb-2" />
                  <p className="font-semibold text-sm">Publishing Guide</p>
                  <p className="text-xs text-gray-600">Amazon KDP steps</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <a 
                href="/"
                className="inline-block bg-blue-900 text-white px-8 py-3 rounded-lg hover:bg-blue-800 transition-colors font-semibold"
              >
                Return to Homepage
              </a>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4 mt-12">
        <div className="max-w-4xl mx-auto text-center text-gray-400">
          <p>© 2025 Convert My Research. Built for researchers, by researchers.</p>
          <p className="mt-2 text-sm">
            🔒 Your thesis is processed securely and deleted within 24 hours
          </p>
        </div>
      </footer>
    </div>
  );
}