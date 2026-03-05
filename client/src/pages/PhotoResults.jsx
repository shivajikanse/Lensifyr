import { motion } from 'framer-motion'
import Button from '../components/Button'

const PhotoResults = ({ photos, onBack }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <div className="w-full px-4 py-8">
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold"
      >
        ← Back
      </motion.button>

      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-4xl font-bold mb-2 text-gray-900"
      >
        Your Matched Photos
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-gray-600 mb-8"
      >
        Found {photos.length} photos matching your face
      </motion.p>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {photos.map((photo) => (
          <motion.div
            key={photo.id}
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            className="card overflow-hidden group"
          >
            <div className="relative h-64 overflow-hidden bg-gray-200">
              <img
                src={photo.url}
                alt="Event photo"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2"
              >
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => downloadPhoto(photo.url)}
                >
                  ⬇ Download
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => sharePhoto(photo.url)}
                >
                  📤 Share
                </Button>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-12 text-center"
      >
        <Button variant="primary" size="lg" onClick={onBack}>
          Find More Photos
        </Button>
      </motion.div>
    </div>
  )
}

const downloadPhoto = (url) => {
  const link = document.createElement('a')
  link.href = url
  link.download = `lensifyr-photo-${Date.now()}.jpg`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const sharePhoto = (url) => {
  if (navigator.share) {
    navigator.share({
      title: 'Check out this photo from Lensifyr',
      text: 'I found this amazing photo on Lensifyr!',
      url: url,
    })
  } else {
    alert('Share functionality is not supported on this device')
  }
}

export default PhotoResults
