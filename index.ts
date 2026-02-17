import { DOMParser } from "linkedom";

// uptightsuperlabs - 2/17/2026 out of laziness you can switch to the one you need down below
//                              with the one named selected.
const efficiency_selector = "#body-content > div > table > tbody > tr:nth-child(1) > td:nth-child(2)";
const one_bedroom_selector = "#body-content > div > table > tbody > tr:nth-child(2) > td:nth-child(2)";
const two_bedroom_selector = "#body-content > div > table > tbody > tr:nth-child(3) > td:nth-child(2)";
const three_bedroom_selector = "#body-content > div > table > tbody > tr:nth-child(4) > td:nth-child(2)";
const four_bedroom_selector = "#body-content > div > table > tbody > tr:nth-child(5) > td:nth-child(2)";

const puntagordaha_payment_standard_zone_url: string = "https://www.puntagordaha.org/payment-standards-zone";
const puntagorda_payment_standard_map_url = "https://www.puntagordaha.org/payment-standards-map"
const selected = three_bedroom_selector;
const results: any[] = [];

const hardcoded_zipcode_list: string[] = [
    "33946", "33947", "33948", "33950", "33952",
    "33953", "33954", "33955", "33980", "33981",
    "33982", "33983", "34223", "34224", "34286",
    "34287", "34288"
];

async function fetch_zipcode_list(): Promise<string[]> {
    console.log("Fetching latest zipcodes");

    try {
        const response = await fetch(puntagorda_payment_standard_map_url);
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.text}`);
        }

        const document = new DOMParser().parseFromString(await response.text(), "text/html");
        const links = document.querySelectorAll("#interior ul li a");
        const zips = new Set<string>();

        // uptightsuperlabs - 2/17/2026 I HATE JAVASCRIPT!
        links.forEach((link: { textContent: string; }) => {
            const text = link.textContent?.trim() || "";
            const match = text.match(/\d{5}/);

            if (match) {
                zips.add(match[0]);
            }
        });

        return Array.from(zips);
    } catch (error) {
        console.error("Failed to fetch zipcodes: Using original fallback");
        return hardcoded_zipcode_list;
    }
}

async function fetch_payment_standard(zip_code: string) {
    const url = `${puntagordaha_payment_standard_zone_url}/${zip_code}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.text}`);
        }

        const document = new DOMParser().parseFromString(await response.text(), "text/html");
        const element = document.querySelector(selected);

        if (element) {
            console.log(`Fetched zip: ${zip_code}`);
            return {
                zip: zip_code,
                payment_standard: element.textContent.trim(),
                scrape_date: new Date().toISOString()
            }
        } else {
            console.warn(`Failed to fetch zip: ${zip_code}`);
            return null;
        }
    } catch (error) {
        console.error(`Zip ${zip_code} has failed: ${error}`);
        return null;
    }
}

const zipcodes = await fetch_zipcode_list();
console.log(`Found ${zipcodes.length} zipcodes`);

for (const zip of zipcodes) {
    const data = await fetch_payment_standard(zip);

    if (data) {
        results.push(data);
    }

    // uptightsuperlabs - 2/17/2026 It's free resources, let's be a little nice to them :)
    await new Promise(res => setTimeout(res, 100)); 
}

await Bun.write("results.json", JSON.stringify(results, null, 4));
console.log("Done!");