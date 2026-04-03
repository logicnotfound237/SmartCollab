/**
 * WAVWriter Lifecycle Test
 * 
 * This test validates that WAVWriter.finalize() properly waits for the file
 * to be fully written and readable before resolving.
 * 
 * The test creates a WAV file, appends synthetic PCM data, finalizes it,
 * and immediately attempts to read the file to confirm no race condition.
 * 
 * Usage: node test-wav-writer-lifecycle.js
 */

const fs = require('fs');
const path = require('path');
const WAVWriter = require('./services/audio/WAVWriter.js');

// Test configuration
const TEST_CONFIG = {
  sampleRate: 16000,
  duration: 5, // seconds
  frequency: 440, // Hz (A4 note)
};

/**
 * Generate synthetic sine wave audio data
 * @param {number} duration - Duration in seconds
 * @param {number} frequency - Frequency in Hz
 * @param {number} sampleRate - Sample rate
 * @returns {Float32Array} - PCM audio data
 */
function generateSineWave(duration, frequency, sampleRate) {
  const numSamples = Math.floor(duration * sampleRate);
  const audioData = new Float32Array(numSamples);
  
  for (let i = 0; i < numSamples; i++) {
    // Generate sine wave
    const sample = Math.sin(2 * Math.PI * frequency * (i / sampleRate));
    // Apply small amplitude to avoid clipping
    audioData[i] = sample * 0.5;
  }
  
  return audioData;
}

/**
 * Run the WAVWriter lifecycle test
 */
async function runTest() {
  console.log('='.repeat(70));
  console.log('WAVWriter Lifecycle Test');
  console.log('='.repeat(70));
  console.log(`Sample Rate: ${TEST_CONFIG.sampleRate} Hz`);
  console.log(`Duration: ${TEST_CONFIG.duration}s`);
  console.log(`Frequency: ${TEST_CONFIG.frequency} Hz`);
  console.log('');

  let testFilePath = null;
  let success = false;

  try {
    // Step 1: Create temp directory
    console.log('Step 1: Setting up temp directory...');
    const tempDir = path.resolve(process.cwd(), 'storage', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    console.log(`   Temp directory: ${tempDir}`);
    console.log('   ✅ Temp directory ready');
    console.log('');

    // Step 2: Generate synthetic audio
    console.log('Step 2: Generating synthetic audio data...');
    const audioData = generateSineWave(
      TEST_CONFIG.duration,
      TEST_CONFIG.frequency,
      TEST_CONFIG.sampleRate
    );
    console.log(`   Generated ${audioData.length} samples (${(audioData.length / TEST_CONFIG.sampleRate).toFixed(2)}s)`);
    console.log('   ✅ Audio data generated');
    console.log('');

    // Step 3: Create WAV file
    console.log('Step 3: Creating WAV file...');
    testFilePath = path.join(tempDir, `test-wav-lifecycle-${Date.now()}.wav`);
    console.log(`   File path: ${testFilePath}`);
    
    const wavWriter = new WAVWriter(testFilePath, TEST_CONFIG.sampleRate, 1);
    console.log(`   WAVWriter created`);
    console.log(`   WAVWriter stats:`, wavWriter.getStats());
    console.log('   ✅ WAVWriter initialized');
    console.log('');

    // Step 4: Append PCM data
    console.log('Step 4: Appending PCM data...');
    wavWriter.appendPCM(audioData);
    console.log(`   Appended ${audioData.length} samples`);
    console.log(`   WAVWriter stats after append:`, wavWriter.getStats());
    console.log('   ✅ PCM data appended');
    console.log('');

    // Step 5: Finalize (the critical test)
    console.log('Step 5: Finalizing WAV file...');
    console.log('   Calling wavWriter.finalize()...');
    
    const finalizedPath = await wavWriter.finalize();
    console.log(`   ✅ Finalize resolved`);
    console.log(`   Finalized path: ${finalizedPath}`);
    console.log('');

    // Step 6: Verify file exists and is readable
    console.log('Step 6: Verifying file is readable...');
    console.log('   Checking if file exists...');
    
    if (!fs.existsSync(finalizedPath)) {
      throw new Error('File does not exist after finalize() resolved');
    }
    console.log('   ✅ File exists');

    console.log('   Attempting to read file...');
    const fileBuffer = fs.readFileSync(finalizedPath);
    console.log(`   ✅ File read successfully (${fileBuffer.length} bytes)`);

    // Step 7: Verify WAV header
    console.log('');
    console.log('Step 7: Verifying WAV header...');
    
    const riffHeader = fileBuffer.slice(0, 4).toString('ascii');
    if (riffHeader !== 'RIFF') {
      throw new Error(`Invalid RIFF header: ${riffHeader}`);
    }
    console.log('   ✅ RIFF header correct');

    const waveHeader = fileBuffer.slice(8, 12).toString('ascii');
    if (waveHeader !== 'WAVE') {
      throw new Error(`Invalid WAVE header: ${waveHeader}`);
    }
    console.log('   ✅ WAVE header correct');

    const fmtHeader = fileBuffer.slice(12, 16).toString('ascii');
    if (fmtHeader !== 'fmt ') {
      throw new Error(`Invalid fmt header: ${fmtHeader}`);
    }
    console.log('   ✅ fmt header correct');

    const dataHeader = fileBuffer.slice(36, 40).toString('ascii');
    if (dataHeader !== 'data') {
      throw new Error(`Invalid data header: ${dataHeader}`);
    }
    console.log('   ✅ data header correct');

    // Step 8: Verify file sizes
    console.log('');
    console.log('Step 8: Verifying file sizes...');
    
    const riffChunkSize = fileBuffer.readUInt32LE(4);
    const dataChunkSize = fileBuffer.readUInt32LE(40);
    const expectedDataSize = audioData.length * 2; // 16-bit = 2 bytes per sample
    const expectedRiffSize = 36 + expectedDataSize;
    
    console.log(`   RIFF chunk size: ${riffChunkSize} (expected: ${expectedRiffSize})`);
    console.log(`   Data chunk size: ${dataChunkSize} (expected: ${expectedDataSize})`);
    
    if (riffChunkSize !== expectedRiffSize) {
      throw new Error(`RIFF chunk size mismatch: ${riffChunkSize} !== ${expectedRiffSize}`);
    }
    console.log('   ✅ RIFF chunk size correct');
    
    if (dataChunkSize !== expectedDataSize) {
      throw new Error(`Data chunk size mismatch: ${dataChunkSize} !== ${expectedDataSize}`);
    }
    console.log('   ✅ Data chunk size correct');

    // Step 9: Verify file is complete
    console.log('');
    console.log('Step 9: Verifying file completeness...');
    const expectedFileSize = 44 + expectedDataSize; // 44 byte header + data
    if (fileBuffer.length !== expectedFileSize) {
      throw new Error(`File size mismatch: ${fileBuffer.length} !== ${expectedFileSize}`);
    }
    console.log(`   File size: ${fileBuffer.length} bytes (expected: ${expectedFileSize})`);
    console.log('   ✅ File size correct');

    success = true;

  } catch (error) {
    console.log('');
    console.log('='.repeat(70));
    console.log('TEST FAILED');
    console.log('='.repeat(70));
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    success = false;
  } finally {
    // Cleanup
    console.log('');
    console.log('Step 10: Cleanup...');
    
    if (testFilePath && fs.existsSync(testFilePath)) {
      try {
        fs.unlinkSync(testFilePath);
        console.log('   ✅ Test file deleted');
      } catch (error) {
        console.log(`   ⚠️  Could not delete test file: ${error.message}`);
      }
    }
  }

  // Final result
  console.log('');
  console.log('='.repeat(70));
  if (success) {
    console.log('✅ TEST PASSED');
    console.log('');
    console.log('WAVWriter lifecycle is working correctly:');
    console.log('  - File is fully written before finalize() resolves');
    console.log('  - No race condition between write and read');
    console.log('  - Headers are correctly updated');
    console.log('  - File is immediately readable after finalize()');
  } else {
    console.log('❌ TEST FAILED');
    console.log('');
    console.log('There is a race condition or file handling issue.');
  }
  console.log('='.repeat(70));

  return success;
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
