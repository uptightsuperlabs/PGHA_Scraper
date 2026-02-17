import { DOMParser } from "linkedom";

// uptightsuperlabs - 2/17/2026 out of laziness you can switch to the one you need down below
//                              with the one named selected.
const efficiency_selector = "#body-content > div > table > tbody > tr:nth-child(1) > td:nth-child(2)";
const one_bedroom_selector = "#body-content > div > table > tbody > tr:nth-child(2) > td:nth-child(2)";
const two_bedroom_selector = "#body-content > div > table > tbody > tr:nth-child(3) > td:nth-child(2)";
const three_bedroom_selector = "#body-content > div > table > tbody > tr:nth-child(4) > td:nth-child(2)";
const four_bedroom_selector = "#body-content > div > table > tbody > tr:nth-child(5) > td:nth-child(2)";

const puntagordaha_url: string = "https://www.puntagordaha.org/payment-standards-zone";
const selected = three_bedroom_selector;
const results: any[] = [];

const zipcode_list: string[] = [
    "33946", "33947", "33948", "33950", "33952", 
    "33953", "33954", "33955", "33980", "33981", 
    "33982", "33983", "34223", "34224", "34286", 
    "34287", "34288"
];

async function fetch_payment_standard(zip_code: string) {
    const url = `${puntagordaha_url}/${zip_code}`;

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

for (const zip of zipcode_list) {
    const data = await fetch_payment_standard(zip);

    if (data) {
        results.push(data);
    }
}

await Bun.write("results.json", JSON.stringify(results, null, 4));
console.log("Done!");