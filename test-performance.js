// #!/usr/bin/env node

// /**
//  * Performance test script for PDF generation
//  * Run this to test the optimized PDF generation speed
//  */

// const http = require("http");

// async function testPDFGeneration() {
//     console.log("🚀 Testing PDF Generation Performance...\n");

//     const testData = {
//         method: "POST",
//         hostname: "localhost",
//         port: 3000,
//         path: "/api/custom-report-generation",
//         headers: {
//             "Content-Type": "application/json",
//         },
//     };

//     const testPayload = JSON.stringify({});

//     return new Promise((resolve, reject) => {
//         const startTime = Date.now();

//         const req = http.request(testData, (res) => {
//             let data = [];

//             res.on("data", (chunk) => {
//                 data.push(chunk);
//             });

//             res.on("end", () => {
//                 const endTime = Date.now();
//                 const totalTime = endTime - startTime;
//                 const buffer = Buffer.concat(data);

//                 console.log(`✅ PDF Generated Successfully!`);
//                 console.log(`📊 Performance Metrics:`);
//                 console.log(
//                     `   • Total Time: ${totalTime}ms (${(
//                         totalTime / 1000
//                     ).toFixed(2)}s)`
//                 );
//                 console.log(
//                     `   • PDF Size: ${(buffer.length / 1024).toFixed(2)} KB`
//                 );
//                 console.log(`   • Status: ${res.statusCode}`);

//                 if (totalTime <= 20000) {
//                     console.log(
//                         `🎯 SUCCESS: Generation time is under 20 seconds!`
//                     );
//                 } else if (totalTime <= 15000) {
//                     console.log(
//                         `🚀 EXCELLENT: Generation time is under 15 seconds!`
//                     );
//                 } else if (totalTime <= 10000) {
//                     console.log(
//                         `⚡ OUTSTANDING: Generation time is under 10 seconds!`
//                     );
//                 } else {
//                     console.log(`⚠️  SLOW: Generation time is over 20 seconds`);
//                 }

//                 resolve({
//                     totalTime,
//                     size: buffer.length,
//                     status: res.statusCode,
//                 });
//             });
//         });

//         req.on("error", (err) => {
//             console.error("❌ Test failed:", err.message);
//             reject(err);
//         });

//         req.on("timeout", () => {
//             console.error("❌ Test timed out");
//             req.destroy();
//             reject(new Error("Request timeout"));
//         });

//         req.setTimeout(60000); // 60 second timeout
//         req.write(testPayload);
//         req.end();
//     });
// }

// async function runMultipleTests(count = 3) {
//     console.log(`Running ${count} performance tests...\n`);

//     const results = [];

//     for (let i = 1; i <= count; i++) {
//         console.log(`\n--- Test ${i}/${count} ---`);
//         try {
//             const result = await testPDFGeneration();
//             results.push(result);

//             // Wait between tests
//             if (i < count) {
//                 console.log("Waiting 2 seconds before next test...");
//                 await new Promise((resolve) => setTimeout(resolve, 2000));
//             }
//         } catch (error) {
//             console.error(`Test ${i} failed:`, error.message);
//         }
//     }

//     if (results.length > 0) {
//         console.log(`\n📈 Summary of ${results.length} successful tests:`);
//         const times = results.map((r) => r.totalTime);
//         const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
//         const minTime = Math.min(...times);
//         const maxTime = Math.max(...times);

//         console.log(
//             `   • Average Time: ${avgTime.toFixed(0)}ms (${(
//                 avgTime / 1000
//             ).toFixed(2)}s)`
//         );
//         console.log(
//             `   • Fastest Time: ${minTime}ms (${(minTime / 1000).toFixed(2)}s)`
//         );
//         console.log(
//             `   • Slowest Time: ${maxTime}ms (${(maxTime / 1000).toFixed(2)}s)`
//         );

//         if (avgTime <= 10000) {
//             console.log(
//                 `\n🎉 GOAL ACHIEVED: Average time is under 10 seconds!`
//             );
//         } else if (avgTime <= 20000) {
//             console.log(
//                 `\n✅ GOOD IMPROVEMENT: Average time is under 20 seconds!`
//             );
//         } else {
//             console.log(
//                 `\n⚠️  NEEDS MORE OPTIMIZATION: Average time is still over 20 seconds`
//             );
//         }
//     }
// }

// // Run the tests
// if (require.main === module) {
//     runMultipleTests(3).catch(console.error);
// }

// module.exports = { testPDFGeneration, runMultipleTests };
