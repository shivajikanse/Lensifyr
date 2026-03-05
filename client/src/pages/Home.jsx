import { useState } from 'react'
import { motion } from 'framer-motion'
import Button from '../components/Button'
import Modal from '../components/Modal'
import PhotoResults from './PhotoResults'

const Home = () => {
  const [eventCode, setEventCode] = useState('')
  const [showPhotoUpload, setShowPhotoUpload] = useState(false)
  const [matchedPhotos, setMatchedPhotos] = useState(null)

  const handleFindPhotos = (e) => {
    e.preventDefault()
    if (eventCode.trim()) {
      setShowPhotoUpload(true)
    }
  }

  const handlePhotosMatched = (photos) => {
    setMatchedPhotos(photos)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{ y: [0, 50, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{ y: [0, -50, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {matchedPhotos ? (
          <PhotoResults photos={matchedPhotos} onBack={() => setMatchedPhotos(null)} />
        ) : (
          <>
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 text-balance">
                Find Your Event Photos
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl">
                Instantly discover your photos using face recognition technology
              </p>
            </motion.div>

            {/* Event Code Input Section */}
            <motion.form
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              onSubmit={handleFindPhotos}
              className="w-full max-w-xl"
            >
              <div className="card p-8">
                <label className="block text-lg font-semibold mb-3">
                  Enter Event Code
                </label>
                <div className="flex gap-3 flex-col sm:flex-row">
                  <input
                    type="text"
                    value={eventCode}
                    onChange={(e) => setEventCode(e.target.value.toUpperCase())}
                    placeholder="e.g., ABC123"
                    className="input-field flex-1"
                    required
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Find My Photos
                  </Button>
                </div>
              </div>
            </motion.form>

            {/* Features Section */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full max-w-4xl"
            >
              {[
                { icon: '🎯', title: 'Fast', desc: 'Get matched results in seconds' },
                { icon: '🔒', title: 'Secure', desc: 'Your data is encrypted & protected' },
                { icon: '📱', title: 'Easy', desc: 'Works on all your devices' },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -5 }}
                  className="card p-6 text-center"
                >
                  <div className="text-4xl mb-3">{feature.icon}</div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </div>

      {/* Photo Upload Modal */}
      <Modal
        isOpen={showPhotoUpload}
        onClose={() => setShowPhotoUpload(false)}
        title="Upload Your Selfie"
        size="lg"
      >
        <PhotoUploadForm
          eventCode={eventCode}
          onPhotosMatched={handlePhotosMatched}
          onClose={() => setShowPhotoUpload(false)}
        />
      </Modal>
    </div>
  )
}

const PhotoUploadForm = ({ eventCode, onPhotosMatched, onClose }) => {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      const mockPhotos = [
        { id: 1, url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400' },
        { id: 2, url: 'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=400' },
        { id: 3, url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400' },
      ]
      onPhotosMatched(mockPhotos)
      onClose()
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border-2 border-dashed border-indigo-300 rounded-lg p-8 text-center">
        {preview ? (
          <div className="space-y-4">
            <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded-lg mx-auto" />
            <p className="text-sm text-gray-600">{file.name}</p>
          </div>
        ) : (
          <div>
            <p className="text-2xl mb-2">📸</p>
            <p className="text-gray-600 mb-2">Drag your selfie here or click to browse</p>
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
              id="photo-input"
              required
            />
            <label htmlFor="photo-input" className="cursor-pointer">
              <Button variant="outline" size="sm" onClick={() => document.getElementById('photo-input').click()}>
                Choose File
              </Button>
            </label>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          className="flex-1"
          disabled={!file}
        >
          Find My Photos
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}

export default Home
