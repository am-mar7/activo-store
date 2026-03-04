export default function OpenInBrowser() {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
        
        <h1 className="text-2xl font-bold mb-4">
          Open in Your Browser
        </h1>
  
        <p className="text-gray-600 mb-6 max-w-xs">
          Google Sign-In doesn’t work inside TikTok or Instagram browser.
          Please open this page in Chrome or Safari.
        </p>
  
        <ol className="text-left text-sm mb-6 space-y-2">
          <li>1. Tap the three dots (⋯)</li>
          <li>2. Select &quot;Open in browser&quot;</li>
        </ol>
  
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <a
            href="/sign-in"
            className="border-2 py-3 rounded-lg"
          >
            Continue with Email Instead
          </a>
        </div>
      </div>
    );
  }