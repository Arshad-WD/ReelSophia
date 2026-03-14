import { exec } from "child_process";
import { promisify } from "util";
import { YoutubeTranscript } from "youtube-transcript";

const execAsync = promisify(exec);

// Function to extract YouTube ID from any URL format
function extractYoutubeId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

async function testExtraction(url: string) {
    console.log(`\n=== Testing Extraction for: ${url} ===`);

    const videoId = extractYoutubeId(url) || url;
    console.log(`Extracted ID: ${videoId}`);

    try {
        console.log("\n--- Method 1: youtube-transcript (HTTP) ---");
        const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);
        const rawTranscript = transcriptData.map(t => t.text).join(" ").trim();
        console.log(`✅ Success! Length: ${rawTranscript.length}`);
        console.log(`Preview: ${rawTranscript.substring(0, 100)}...`);
    } catch (err: any) {
        console.error(`❌ youtube-transcript failed:`, err.message);
    }

    try {
        console.log("\n--- Method 2: yt-dlp Auto Subs ---");
        const subCmd = `python3 -m yt_dlp "${url}" --write-auto-subs --skip-download --sub-format "vtt" --no-warnings --print "Subs found"`;
        const { stdout, stderr } = await execAsync(subCmd, { timeout: 30000 });
        if (stdout) console.log(`✅ Success! stdout: ${stdout.trim()}`);
        if (stderr) console.error(`⚠️ stderr: ${stderr.trim()}`);
    } catch (err: any) {
        console.error(`❌ yt-dlp Auto Subs failed:`, err.message);
    }

    try {
        console.log("\n--- Method 3: yt-dlp Android Spoofing (Audio Only) ---");
        const metaCmd = `python3 -m yt_dlp "${url}" -F --extractor-args "youtube:player_client=android,web" --no-warnings`;
        const { stdout, stderr } = await execAsync(metaCmd, { timeout: 30000 });
        console.log(`✅ Success! Formats available.`);
        // console.log(`stdout preview: \n${stdout.substring(0, 500)}...`);
    } catch (err: any) {
        console.error(`❌ yt-dlp Android Spoofing failed:`, err.message);
    }
}

async function main() {
    await testExtraction("https://youtube.com/shorts/OGMvO9kbAqk?si=Im4GTqcJg-xweaSP");
}

main().catch(console.error);
