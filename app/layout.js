import './globals.css'

export const metadata = {
  title: 'ShiftMate 2.0 | Kuwait Edition',
  description: 'The ultimate professional companion for Kuwait employees.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  themeColor: '#0A0E17',
  manifest: '/manifest.json',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        <div className="app-container">
          {children}
        </div>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(reg) {
                    console.log('SW Registered!', reg.scope);
                  }, function(err) {
                    console.log('SW Fail:', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
