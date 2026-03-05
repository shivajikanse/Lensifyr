import { useState } from 'react'
import { motion } from 'framer-motion'
import Button from '../components/Button'
import Modal from '../components/Modal'
import { formatDate } from '../utils/formatDate'
import { generateEventCode } from '../utils/generateId'

const Profile = ({ user, onLogout }) => {
  const [events, setEvents] = useState([])
  const [showCreateEvent, setShowCreateEvent] = useState(false)

  const handleCreateEvent = (newEvent) => {
    setEvents([...events, newEvent])
    setShowCreateEvent(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 mb-8 flex flex-col md:flex-row md:items-center md:justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome, {user?.email?.split('@')[0]}!
            </h1>
            <p className="text-gray-600">Manage your events and uploads</p>
          </div>
          <Button variant="outline" onClick={onLogout} className="mt-4 md:mt-0">
            Logout
          </Button>
        </motion.div>

        {/* Create Event Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Button
            variant="primary"
            size="lg"
            onClick={() => setShowCreateEvent(true)}
          >
            + Create New Event
          </Button>
        </motion.div>

        {/* Events List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {events.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-2xl mb-4">📸</p>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No events yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first event to start uploading photos
              </p>
              <Button
                variant="primary"
                onClick={() => setShowCreateEvent(true)}
              >
                Create Event
              </Button>
            </div>
          ) : (
            events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="card p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                    <p className="text-gray-600">
                      📅 {formatDate(event.date)}
                    </p>
                    <p className="text-indigo-600 font-mono font-semibold mt-2">
                      Code: {event.code}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm">
                      View Photos
                    </Button>
                    <Button variant="secondary" size="sm">
                      Upload More
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>

      {/* Create Event Modal */}
      <Modal
        isOpen={showCreateEvent}
        onClose={() => setShowCreateEvent(false)}
        title="Create New Event"
        size="lg"
      >
        <CreateEventForm onSuccess={handleCreateEvent} />
      </Modal>
    </div>
  )
}

const CreateEventForm = ({ onSuccess }) => {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [uploadMethod, setUploadMethod] = useState('upload')
  const [gdLink, setGdLink] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title || !date) return

    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const newEvent = {
        id: Date.now(),
        title,
        date,
        code: generateEventCode(),
        uploadMethod,
        photoCount: uploadMethod === 'upload' ? (file ? 1 : 0) : 0,
      }
      onSuccess(newEvent)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Event Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-field"
          placeholder="e.g., Wedding Reception"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Event Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input-field"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">Upload Photos</label>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              value="upload"
              checked={uploadMethod === 'upload'}
              onChange={(e) => setUploadMethod(e.target.value)}
            />
            <span>Upload from device</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              value="gdrive"
              checked={uploadMethod === 'gdrive'}
              onChange={(e) => setUploadMethod(e.target.value)}
            />
            <span>Google Drive link</span>
          </label>
        </div>
      </div>

      {uploadMethod === 'upload' && (
        <div className="border-2 border-dashed border-indigo-300 rounded-lg p-6">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setFile(e.target.files)}
            className="block w-full"
          />
          <p className="text-sm text-gray-600 mt-2">
            {file ? `${file.length} file(s) selected` : 'No files selected'}
          </p>
        </div>
      )}

      {uploadMethod === 'gdrive' && (
        <div>
          <label className="block text-sm font-medium mb-2">Google Drive Link</label>
          <input
            type="url"
            value={gdLink}
            onChange={(e) => setGdLink(e.target.value)}
            className="input-field"
            placeholder="https://drive.google.com/drive/folders/..."
          />
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          className="flex-1"
        >
          Create Event
        </Button>
      </div>
    </form>
  )
}

export default Profile
