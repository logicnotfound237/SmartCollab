const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { promisify } = require('util');
const { exec } = require('child_process');
const execAsync = promisify(exec);

async function testAudioPipeline() {
  console.log('Starting audio transcription pipeline test...');
  
  // Test 1: Check whisper binary
  console.log('Test 1: Checking whisper binary...');
  try {
    const { stdout, stderr } = await execAsync('./whisper/whisper --help');
    console.log('✓ Whisper binary found and working');
  } catch (error) {
    console.error('✗ Whisper binary not found or not executable');
    console.log('Please ensure whisper.cpp is compiled and in the project root');
    return false;
  }
  
  // Test 2: Check model file
  console.log('Test 2: Checking model file...');
  const modelPath = 'whisper/models/ggml-base.en.bin';
  if (fs.existsSync(modelPath)) {
    console.log('✓ Model file found: ' + modelPath);
  } else {
    console.error('✗ Model file not found: ' + modelPath);
    console.log('Please download a whisper model to the models/ directory');
    return false;
  }
  
  // Test 3: Test transcription with sample audio
  console.log('Test 3: Testing transcription with sample audio...');
  const sampleAudio = path.join(__dirname, 'sample_audio.wav');
  
  if (!fs.existsSync(sampleAudio)) {
    console.log('Creating sample audio file...');
    // Create a simple sine wave audio file
    await createSampleAudio(sampleAudio);
  }
  
  try {
    const result = await testWhisperTranscription(sampleAudio);
    if (result.success) {
      console.log('✓ Transcription successful');
      console.log('Transcript: ' + result.transcript.text.substring(0, 100) + '...');
    } else {
      console.error('✗ Transcription failed:', result.error);
      return false;
    }
  } catch (error) {
    console.error('✗ Transcription test error:', error.message);
    return false;
  }
  
  // Test 4: Test WAV writer
  console.log('Test 4: Testing WAV writer...');
  try {
    const wavWriter = new (require('./services/audio/WAVWriter.js'))(path.join(__dirname, 'sample_audio.wav'));
    const sampleData = new Float32Array(48000); // 1 second of audio
    for (let i = 0; i < 48000; i++) {
      sampleData[i] = Math.sin(2 * Math.PI * 440 * (i / 48000)); // 440Hz sine wave
    }
    wavWriter.appendPCM(sampleData);
    wavWriter.finalize();
    
    console.log('✓ WAV writer working');
    fs.unlinkSync(path.join(__dirname, 'sample_audio.wav'));
  } catch (error) {
    console.error('✗ WAV writer failed:', error.message);
    return false;
  }
  
  // Test 5: Test transcription queue
  console.log('Test 5: Testing transcription queue...');
  try {
    const TranscriptionQueue = require('./services/transcription/transcriptionQueue.js');
    const queue = new TranscriptionQueue(2);
    
    console.log('✓ Transcription queue initialized');
    console.log('Queue stats:', queue.getQueueStats());
  } catch (error) {
    console.error('✗ Transcription queue failed:', error.message);
    return false;
  }
  
  // Test 6: Test transcript merger
  console.log('Test 6: Testing transcript merger...');
  try {
    const TranscriptMerger = require('./services/transcription/transcriptMerger.js');
    const merger = new TranscriptMerger();
    
    const testTranscripts = [
      {
        success: true,
        userId: 'user1',
        transcript: {
          segments: [
            { start: 0, end: 2, text: 'Hello everyone' },
            { start: 2, end: 5, text: 'Lets start the meeting' }
          ],
          text: 'Hello everyone Lets start the meeting'
        }
      },
      {
        success: true,
        userId: 'user2',
        transcript: {
          segments: [
            { start: 1, end: 3, text: 'Hi there' },
            { start: 3, end: 6, text: 'Im ready' }
          ],
          text: 'Hi there Im ready'
        }
      }
    ];
    
    const merged = merger.mergeTranscripts(testTranscripts);
    console.log('✓ Transcript merger working');
    console.log('Merged timeline:', merged.timeline);
  } catch (error) {
    console.error('✗ Transcript merger failed:', error.message);
    return false;
  }
  
  // Test 7: Test summary service
  console.log('Test 7: Testing summary service...');
  try {
    const SummaryService = require('./services/summary/summaryService.js');
    const summaryService = new SummaryService();
    
    const testMeetingData = {
      meetingId: 'test-meeting',
      title: 'Test Meeting',
      participants: ['User A', 'User B'],
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      duration: 300,
      timeline: [],
      transcriptText: 'This is a test transcript'
    };
    
    const summary = await summaryService.generateSummary(testMeetingData);
    console.log('✓ Summary service working');
    console.log('Summary title: ' + summary.summary.title);
  } catch (error) {
    console.error('✗ Summary service failed:', error.message);
    return false;
  }
  
  console.log('\n✅ All tests passed! Audio transcription pipeline is ready.');
  return true;
}

async function createSampleAudio(filePath) {
  // Create a simple sine wave audio file
  const fs = require('fs');
  const { spawn } = require('child_process');
  
  return new Promise((resolve, reject) => {    
    const ffmpeg = spawn('ffmpeg', [
      '-f', 'lavfi',
      '-i', 'anullsrc=r=16000:cl=mono',
      '-t', '1',
      '-ar', '16000',
      '-ac', '1',
      '-c:a', 'pcm_s16le',
      filePath,
      '-y'
    ]);

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error('ffmpeg failed with code ' + code));
      }
    });

    ffmpeg.stderr.on('data', (data) => {
      console.log(data.toString());
    });
  });
}

async function testWhisperTranscription(filePath) {
  const WhisperRunner = require('./services/transcription/whisperRunner.js');
  const whisperRunner = new WhisperRunner();
  
  try {
    return await whisperRunner.transcribe(filePath);
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Run tests
if (require.main === module) {
  testAudioPipeline()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testAudioPipeline, createSampleAudio, testWhisperTranscription };