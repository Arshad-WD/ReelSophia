import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function testInstagramExtraction(url: string) {
    console.log(`\n=== Testing Instagram Extraction for: ${url} ===`);

    // Clean URL
    let finalUrl = url.split('?')[0];
    if (finalUrl.includes('/p/')) {
        finalUrl = finalUrl.replace('/p/', '/reel/');
    }

    try {
        console.log("\n--- Method 1: snapinsta ---");
        const snapinsta = await import("snapinsta");
        const igUrl = snapinsta.default ? await snapinsta.default(finalUrl) : await (snapinsta as any)(finalUrl);
        
        if (igUrl && igUrl.length > 0 && igUrl[0].url) {
            console.log(`✅ Success! SnapInsta returned data.`);
            console.log(`Download URL found: ${igUrl[0].url.substring(0, 50)}...`);
        } else {
            console.error(`❌ SnapInsta failed to return a valid URL.`);
        }
    } catch (err: any) {
        console.error(`❌ SnapInsta error:`, err.message);
    }

    try {
        console.log("\n--- Method 2: instagram-url-direct ---");
        const igDownloader = await import("instagram-url-direct");
        const res = await igDownloader.default(finalUrl);
        
        if (res && res.url_list && res.url_list.length > 0) {
            console.log(`✅ Success! instagram-url-direct returned data.`);
            console.log(`Download URL found: ${res.url_list[0].substring(0, 50)}...`);
        } else {
             console.error(`❌ instagram-url-direct failed.`);
        }
    } catch (err: any) {
         console.error(`❌ instagram-url-direct error:`, err.message);
    }

    try {
        console.log("\n--- Method 3: yt-dlp Android Spoofing ---");
        const metaCmd = `python3 -m yt_dlp "${finalUrl}" -F --extractor-args "youtube:player_client=android,web" --geo-bypass --no-warnings`;
        const { stdout, stderr } = await execAsync(metaCmd, { timeout: 30000 });
        console.log(`✅ Success! Formats available.`);
    } catch (err: any) {
        console.error(`❌ yt-dlp Android Spoofing failed:`, err.message);
    }
}

async function main() {
    await testInstagramExtraction("https://www.instagram.com/reel/DVQqoZvkwcI/?utm_source=ig_web_copy_link&igsh=NTc4MTIwNjQ2YQ==");
}

main().catch(console.error);
