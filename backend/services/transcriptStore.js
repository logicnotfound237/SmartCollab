/**
 * In-memory transcript store for accumulating room transcripts
 * Stores segments by roomId with deduplication and chronological ordering
 */

const roomTranscripts = {};

/**
 * Initialize room if it doesn't exist
 */
function _ensureRoom(roomId) {
  if (!roomTranscripts[roomId]) {
    roomTranscripts[roomId] = [];
  }
}

/**
 * Check if segment already exists (deduplication based on userId, start, end, and text)
 */
function _segmentExists(roomId, segment) {
  return roomTranscripts[roomId].some(existing => 
    existing.userId === segment.userId &&
    existing.start === segment.start &&
    existing.end === segment.end &&
    existing.text === segment.text
  );
}

/**
 * Add a transcript segment to a room
 * Validates inputs and prevents duplicates
 * @param {string} roomId - Room identifier
 * @param {object} segment - Segment object with userId, text, start, end
 * @returns {boolean} - True if segment was added, false if skipped
 */
function addSegment(roomId, segment) {
  if (!roomId || !segment) return false;
  
  const { userId, text, start, end } = segment;
  
  // Validate required fields
  if (!userId || typeof start !== 'number' || typeof end !== 'number') {
    console.warn('[TranscriptStore] Invalid segment: missing required fields');
    return false;
  }
  
  // Ignore empty text segments
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return false;
  }
  
  // Ensure room exists
  _ensureRoom(roomId);
  
  // Check for duplicate
  if (_segmentExists(roomId, segment)) {
    console.log(`[TranscriptStore] Duplicate segment detected for room ${roomId}`);
    return false;
  }
  
  // Add segment
  roomTranscripts[roomId].push({
    userId,
    text: text.trim(),
    start,
    end
  });
  
  return true;
}

/**
 * Get full transcript array for a room, sorted chronologically
 * @param {string} roomId - Room identifier
 * @returns {Array} - Array of transcript segments
 */
function getRoomTranscript(roomId) {
  if (!roomTranscripts[roomId]) {
    return [];
  }
  
  return [...roomTranscripts[roomId]].sort((a, b) => a.start - b.start);
}

/**
 * Get merged transcript text for a room, in chronological order
 * @param {string} roomId - Room identifier
 * @returns {string} - Merged text string
 */
function getRoomTranscriptText(roomId) {
  return getRoomTranscript(roomId)
    .map(s => s.text)
    .join(' ');
}

/**
 * Clear transcript for a room
 * @param {string} roomId - Room identifier
 */
function clearRoom(roomId) {
  if (roomTranscripts[roomId]) {
    delete roomTranscripts[roomId];
  }
}

/**
 * Get count of segments in a room
 * @param {string} roomId - Room identifier
 * @returns {number} - Number of segments
 */
function getSegmentCount(roomId) {
  return roomTranscripts[roomId]?.length || 0;
}

/**
 * Get all rooms with transcripts
 * @returns {Array} - Array of room IDs
 */
function getAllRooms() {
  return Object.keys(roomTranscripts);
}

module.exports = {
  addSegment,
  getRoomTranscript,
  getRoomTranscriptText,
  clearRoom,
  getSegmentCount,
  getAllRooms,
  roomTranscripts
};
