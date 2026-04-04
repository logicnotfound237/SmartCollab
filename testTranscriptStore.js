const {
  addSegment,
  getRoomTranscript,
  getRoomTranscriptText,
  clearRoom
} = require('./backend/services/transcriptStore');

const roomId = "room1";

// Clean start
clearRoom(roomId);

console.log("=== TEST START ===");

// -----------------------------
// 1. Duplicate Test
// -----------------------------
console.log("\nTest 1: Duplicate Handling");

addSegment(roomId, {
  userId: "user1",
  text: "Hello world",
  start: 1,
  end: 2
});

addSegment(roomId, {
  userId: "user1",
  text: "Hello world",
  start: 1,
  end: 2
}); // duplicate

const transcript1 = getRoomTranscript(roomId);
console.log("Segments count (should be 1):", transcript1.length);

// -----------------------------
// 2. Out-of-Order Test
// -----------------------------
console.log("\nTest 2: Ordering");

addSegment(roomId, {
  userId: "user1",
  text: "Second sentence",
  start: 10,
  end: 11
});

addSegment(roomId, {
  userId: "user1",
  text: "First sentence",
  start: 2,
  end: 3
});

const transcript2 = getRoomTranscript(roomId);

console.log("Ordered transcript:");
transcript2.forEach(s => {
  console.log(`${s.start}: ${s.text}`);
});

// -----------------------------
// 3. Empty Segment Test
// -----------------------------
console.log("\nTest 3: Empty Text");

addSegment(roomId, {
  userId: "user1",
  text: "",
  start: 20,
  end: 21
});

const transcript3 = getRoomTranscript(roomId);
console.log("Segments count (should NOT increase):", transcript3.length);

// -----------------------------
// 4. Full Text Output
// -----------------------------
console.log("\nTest 4: Full Text Merge");

const fullText = getRoomTranscriptText(roomId);
console.log("Merged Text:", fullText);

console.log("\n=== TEST END ===");