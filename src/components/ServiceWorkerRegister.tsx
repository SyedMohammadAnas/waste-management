'use client'

import { useEffect } from 'react'

/**
 * Service Worker Registration Component for PWA
 * Handles registration and updates for the service worker
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    // Only register service worker in production and if supported
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      // Register service worker
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration)

          // Check for updates
          registration.addEventListener('updatefound', () => {
            console.log('Service Worker update found')
            const newWorker = registration.installing

            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('New Service Worker installed, ready to activate')
                  // Optionally show update notification to user
                  // For now, we'll auto-activate the new worker
                  newWorker.postMessage({ type: 'SKIP_WAITING' })
                }
              })
            }
          })

          // Listen for controlling service worker changes
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('Service Worker controller changed')
            // Optionally reload the page to use new service worker
            window.location.reload()
          })
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error)
        })

      // Also register for app installation prompt
      let deferredPrompt: any = null

      window.addEventListener('beforeinstallprompt', (e) => {
        console.log('PWA install prompt triggered')
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault()
        // Store the event for later use
        deferredPrompt = e

        // Optionally show custom install UI
        // For now, we'll let the browser handle it naturally
      })

      window.addEventListener('appinstalled', () => {
        console.log('PWA was installed successfully')
        deferredPrompt = null
      })
    } else if (process.env.NODE_ENV === 'development') {
      console.log('Service Worker registration skipped in development mode')
    }
  }, [])

  // This component doesn't render anything
  return null
}
