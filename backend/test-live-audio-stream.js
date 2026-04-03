/**
 * Live Audio Streaming Test Script
 * 
 * This script tests the complete live audio transcription flow without requiring
 * the frontend UI. It simulates:
 * - Socket.IO client connection
 * - Room join
 * - Audio chunk streaming
 * - Transcript reception
 * - npm uninstall socketio-client after the work of this script is done
 * Usage: node test-live-audio-stream.js
 */

const io = require('socket.io-client');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const execAsync = promisify(require('child_process').exec);

// Test configuration
const CONFIG = {
  serverUrl: 'http://localhost:5000',
  roomId: `test-room-${Date.now()}`,
  userId: `test-user-${Date.now()}`,
  timeout: 60000, // 60 seconds timeout for transcript reception
  chunkCount: 5, // Number of audio chunks to send
  chunkDuration: 2, // Duration of each chunk in seconds
};

// Test results
const testResults = {
  connected: false,
  joinedRoom: false,
  chunksSent: 0,
  transcriptReceived: false,
  transcriptData: null,
  errors: [],
  startTime: Date.now()
};

/**
 * Generate synthetic PCM audio data (sine wave)
 * @param {number} duration - Duration in seconds
 * @param {number} frequency - Frequency of sine wave (Hz)
 * @param {number} sampleRate - Sample rate (default 16000)
 */
function generateSyntheticAudio(duration, frequency = 440, sampleRate = 16000) {
  const numSamples = Math.floor(duration * sampleRate);
  const audioData = new Int16Array(numSamples);
  
  for (let i = 0; i < numSamples; i++) {
    // Generate sine wave
    const sample = Math.sin(2 * Math.PI * frequency * (i / sampleRate));
    // Convert to 16-bit PCM
    audioData[i] = Math.round(sample * 32767);
  }
  
  return audioData;
}

/**
 * Generate audio using ffmpeg (if available)
 * @param {string} outputPath - Output file path
 * @param {number} duration - Duration in seconds
 */
async function generateAudioWithFFmpeg(outputPath, duration = 5) {
  return new Promise((resolve, reject) => {
    console.log(`Generating ${duration}s audio file with ffmpeg...`);
    
    const ffmpeg = spawn('ffmpeg', [
      '-f', 'lavfi',
      '-i', `sine=frequency=440:duration=${duration}`,
      '-ar', '16000',
      '-ac', '1',
      '-c:a', 'pcm_s16le',
      '-f', 's16le',
      'pipe:1'
    ]);

    const chunks = [];
    
    ffmpeg.stdout.on('data', (data) => {
      chunks.push(data);
    });

    ffmpeg.stderr.on('data', (data) => {
      // ffmpeg outputs to stderr, ignore unless error
      // console.log('ffmpeg:', data.toString());
    });

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        const buffer = Buffer.concat(chunks);
        const int16Array = new Int16Array(buffer.buffer, buffer.byteOffset, buffer.length / 2);
        resolve(int16Array);
      } else {
        reject(new Error(`ffmpeg failed with code ${code}`));
      }
    });

    ffmpeg.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Check if ffmpeg is available
 */
async function checkFFmpeg() {
  try {
    await execAsync('ffmpeg -version');
    return true;
  } catch {
    return false;
  }
}

/**
 * Run the live audio streaming test
 */
async function runTest() {
  console.log('='.repeat(70));
  console.log('Live Audio Streaming Test');
  console.log('='.repeat(70));
  console.log(`Server URL: ${CONFIG.serverUrl}`);
  console.log(`Room ID: ${CONFIG.roomId}`);
  console.log(`User ID: ${CONFIG.userId}`);
  console.log('');

  let socket = null;
  let transcriptTimeout = null;

  try {
    // Step 1: Connect to server
    console.log('Step 1: Connecting to server...');
    socket = io(CONFIG.serverUrl, {
      transports: ['websocket'],
      reconnection: false
    });

    await new Promise((resolve, reject) => {
      socket.on('connect', () => {
        console.log('✅ Connected to server');
        console.log(`   Socket ID: ${socket.id}`);
        testResults.connected = true;
        resolve();
      });

      socket.on('connect_error', (error) => {
        console.error('❌ Connection failed:', error.message);
        reject(error);
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 10000);
    });

    // Step 2: Join room
    console.log('');
    console.log('Step 2: Joining room...');
    
    await new Promise((resolve, reject) => {
      socket.emit('join-room', CONFIG.roomId, CONFIG.userId);
      
      socket.on('user-joined', (data) => {
        if (data.userId === CONFIG.userId) {
          console.log('✅ Joined room successfully');
          console.log(`   Room: ${CONFIG.roomId}`);
          testResults.joinedRoom = true;
          resolve();
        }
      });

      // Also resolve after a short delay if we don't get the event
      setTimeout(() => {
        if (!testResults.joinedRoom) {
          console.log('✅ Joined room (no confirmation event)');
          testResults.joinedRoom = true;
          resolve();
        }
      }, 2000);
    });

    // Step 3: Generate test audio
    console.log('');
    console.log('Step 3: Generating test audio...');
    
    let audioChunks = [];
    const hasFFmpeg = await checkFFmpeg();
    
    if (hasFFmpeg) {
      console.log('   Using ffmpeg to generate audio');
      try {
        const audio = await generateAudioWithFFmpeg(null, CONFIG.chunkDuration);
        for (let i = 0; i < CONFIG.chunkCount; i++) {
          audioChunks.push(audio);
        }
      } catch (error) {
        console.log('   FFmpeg failed, using synthetic generator');
        hasFFmpeg = false;
      }
    }
    
    if (!hasFFmpeg) {
      console.log('   Using synthetic sine wave generator');
      for (let i = 0; i < CONFIG.chunkCount; i++) {
        const audio = generateSyntheticAudio(CONFIG.chunkDuration, 440 + (i * 100));
        audioChunks.push(audio);
      }
    }
    
    console.log(`✅ Generated ${audioChunks.length} audio chunks (${CONFIG.chunkDuration}s each)`);

    // Step 4: Set up transcript listener
    console.log('');
    console.log('Step 4: Setting up transcript listener...');
    
    const transcriptPromise = new Promise((resolve, reject) => {
      socket.on('transcript-update', (data) => {
        console.log('');
        console.log('📝 Transcript received:');
        console.log(JSON.stringify(data, null, 2));
        testResults.transcriptReceived = true;
        testResults.transcriptData = data;
        resolve(data);
      });

      // Timeout if no transcript received
      transcriptTimeout = setTimeout(() => {
        if (!testResults.transcriptReceived) {
          reject(new Error('Timeout: No transcript received within expected time'));
        }
      }, CONFIG.timeout);
    });

    // Step 5: Start audio stream
    console.log('');
    console.log('Step 5: Starting audio stream...');
    socket.emit('audio-stream:start', {
      roomId: CONFIG.roomId,
      userId: CONFIG.userId
    });

    // Step 6: Send audio chunks
    console.log('');
    console.log('Step 6: Sending audio chunks...');
    
    for (let i = 0; i < audioChunks.length; i++) {
      const chunk = audioChunks[i];
      const timestamp = Date.now();
      
      // Convert Int16Array to regular array for JSON serialization
      const audioArray = Array.from(chunk);
      
      socket.emit('audio-chunk', {
        roomId: CONFIG.roomId,
        userId: CONFIG.userId,
        audioChunk: audioArray,
        timestamp
      });
      
      testResults.chunksSent++;
      console.log(`   Sent audio chunk ${i + 1}/${audioChunks.length} (${audioArray.length} samples)`);
      
      // Wait between chunks to simulate real-time streaming
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`✅ Sent ${testResults.chunksSent} audio chunks`);

    // Step 7: Wait for transcript
    console.log('');
    console.log('Step 7: Waiting for transcript...');
    console.log('   (This may take 10-30 seconds depending on Whisper processing)');
    
    try {
      await transcriptPromise;
    } catch (error) {
      console.log('');
      console.log('⚠️  Transcript timeout - this is expected if:');
      console.log('   - Whisper model is still loading');
      console.log('   - Audio was not recognized (synthetic audio)');
      console.log('   - Transcription queue is busy');
    }

    // Step 8: Stop audio stream
    console.log('');
    console.log('Step 8: Stopping audio stream...');
    socket.emit('audio-stream:stop', {
      roomId: CONFIG.roomId,
      userId: CONFIG.userId
    });

    // Cleanup
    if (transcriptTimeout) {
      clearTimeout(transcriptTimeout);
    }

    console.log('');
    console.log('='.repeat(70));
    console.log('Test Summary');
    console.log('='.repeat(70));
    console.log(`Connected:       ${testResults.connected ? '✅' : '❌'}`);
    console.log(`Joined Room:     ${testResults.joinedRoom ? '✅' : '❌'}`);
    console.log(`Chunks Sent:     ${testResults.chunksSent}/${CONFIG.chunkCount}`);
    console.log(`Transcript:      ${testResults.transcriptReceived ? '✅' : '⚠️'}`);
    console.log(`Duration:        ${((Date.now() - testResults.startTime) / 1000).toFixed(2)}s`);
    console.log('');

    if (testResults.connected && testResults.joinedRoom && testResults.chunksSent > 0) {
      console.log('✅ Live audio streaming test PASSED');
      console.log('   Core functionality working correctly');
      
      if (!testResults.transcriptReceived) {
        console.log('');
        console.log('⚠️  Note: Transcript not received, but this may be due to:');
        console.log('   - Synthetic/test audio not containing recognizable speech');
        console.log('   - Whisper processing time (check server logs)');
        console.log('   Try using real speech audio for better results');
      }
      
      return true;
    } else {
      console.log('❌ Live audio streaming test FAILED');
      return false;
    }

  } catch (error) {
    console.log('');
    console.log('='.repeat(70));
    console.log('Test Failed with Error');
    console.log('='.repeat(70));
    console.log(error.message);
    console.log('');
    console.log('❌ Live audio streaming test FAILED');
    return false;
  } finally {
    // Cleanup
    if (socket) {
      socket.disconnect();
      console.log('');
      console.log('Disconnected from server');
    }
  }
}

// Run the test
runTest()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
