import { useState } from 'react'
import { Button } from './Button'
import { Input } from './Input'

interface Location {
  lat: number
  lng: number
  address: string
}

interface LocationPickerProps {
  onLocationChange: (location: Location) => void
  error?: string
}

export const LocationPicker = ({ onLocationChange, error }: LocationPickerProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [location, setLocation] = useState<Location | null>(null)
  const [manualAddress, setManualAddress] = useState('')

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }

    setIsLoading(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        try {
          // Reverse geocode to get address (using a free service)
          // In production, you might want to use Google Maps Geocoding API
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          )
          const data = await response.json()

          const loc: Location = {
            lat: latitude,
            lng: longitude,
            address: data.display_name || `${latitude}, ${longitude}`,
          }

          setLocation(loc)
          onLocationChange(loc)
        } catch (err) {
          // Fallback: use coordinates as address
          const loc: Location = {
            lat: latitude,
            lng: longitude,
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          }

          setLocation(loc)
          onLocationChange(loc)
        } finally {
          setIsLoading(false)
        }
      },
      (err) => {
        setIsLoading(false)
        alert('Unable to get location: ' + err.message)
      }
    )
  }

  const handleManualAddress = () => {
    if (!manualAddress.trim()) {
      alert('Please enter an address')
      return
    }

    // For manual entry, use default coordinates (user can refine later)
    // In production, you'd geocode the address to get coordinates
    const loc: Location = {
      lat: 0,
      lng: 0,
      address: manualAddress,
    }

    setLocation(loc)
    onLocationChange(loc)
  }

  return (
    <div className="w-full space-y-4">
      <label className="label">Location</label>

      {!location ? (
        <>
          <div className="space-y-2">
            <Button
              type="button"
              onClick={getCurrentLocation}
              isLoading={isLoading}
              className="w-full"
            >
              📍 Use Current Location
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter address manually"
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleManualAddress()}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleManualAddress}
              >
                Set
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-green-900">Location Set</p>
              <p className="text-sm text-green-700 mt-1">{location.address}</p>
              {location.lat !== 0 && location.lng !== 0 && (
                <p className="text-xs text-green-600 mt-1">
                  Coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setLocation(null)
                setManualAddress('')
              }}
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              Change
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
