const fs = require('fs');
const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;
require('dotenv').config()

// Configure Cloudinary
cloudinary.config({
    cloud_name: "fetch-images", // add your cloud_name
    api_key: process.env.API_KEY, // add your api_key
    api_secret: process.env.API_SECRET, // add your api_secret
    secure: true
});

let result = [];
const options = { resource_type: "image", folder: "Data Graph MCQs", max_results: 80 };

// Recursive function to list resources
function listResources(next_cursor) {
    if (next_cursor) {
        options["next_cursor"] = next_cursor;
    }

    cloudinary.api.resources(options, function (error, res) {
        if (error) {
            console.log(error);
            return;
        }

        const more = res.next_cursor;
        const resources = res.resources;

        for (let resource of resources) {
            const resultTemp = {
                id: crypto.randomUUID(),
                name: `Image ${result.length + 1}`,
                imageUrl: resource.secure_url,
                description: "This is a a chart for now."
            };
            result.push(resultTemp);
        }

        if (more) {
            listResources(more);
        } else {
            console.log("Fetching completed.");
            saveResultsToJson(result);
        }
    });
}

// Function to save results to JSON file
function saveResultsToJson(data) {
    const jsonObject = JSON.stringify(data, null, 2);
    const jsonFilePath = __dirname+'/dataGraphs.json';

    fs.writeFile(jsonFilePath, jsonObject, 'utf8', (err) => {
        if (err) {
            console.error('An error occurred while writing JSON to file:', err);
            return;
        }
        console.log('JSON file has been saved.');
    });
}

// Start fetching resources
listResources(null);
